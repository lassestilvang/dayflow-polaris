import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import {
  calendars,
  events,
  tasks,
  taskLabels,
  taskLabelAssignments,
  type Calendar,
  type Event,
  type Task,
  type TaskLabel
} from "@/lib/db/schema";
import { and, eq, gte, lt, inArray, isNull, ne, or } from "drizzle-orm";
import { requireSession } from "@/lib/auth/guards";
import { getWeekRangeFromWeekId, getWeekId } from "@/lib/calendar/date-utils";
import WeekPlannerPage from "./week-planner-page";

type TaskWithSubtasksAndLabels = Task & {
  labels: TaskLabel[];
};

function parseWeekId(weekIdParam: string | string[] | undefined): string {
  if (typeof weekIdParam !== "string") {
    return getWeekId(new Date());
  }
  const match = /^(\d{4})-W(\d{2})$/.exec(weekIdParam);
  if (!match) {
    return getWeekId(new Date());
  }

  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(week) || week < 1 || week > 53) {
    return getWeekId(new Date());
  }

  return weekIdParam;
}

export default async function WeekPage({
  params
}: {
  params: { weekId?: string };
}): Promise<JSX.Element> {
  const session = await requireSession();
  const workspaceId = session.workspaceId;

  if (!workspaceId) {
    // Step 2 semantics: workspace is required for app views.
    redirect("/app");
  }

  const weekId = parseWeekId(params.weekId);
  const { start, end } = getWeekRangeFromWeekId(weekId);

  // Fetch calendars for workspace
  const calendarRows = await db
    .select()
    .from(calendars)
    .where(eq(calendars.workspaceId, workspaceId));

  const calendarIds = calendarRows.map((c) => c.id);

  // Fetch events in week for those calendars
  let eventRows: Event[] = [];
  if (calendarIds.length > 0) {
    eventRows = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          inArray(events.calendarId, calendarIds),
          gte(events.start, start),
          lt(events.start, end)
        )
      );
  }

  // Fetch tasks: scheduled in range OR unscheduled non-archived for sidebar
  const taskRows = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.workspaceId, workspaceId),
        or(
          and(
            gte(tasks.scheduledStart, start),
            lt(tasks.scheduledStart, end)
          ),
          and(
            isNull(tasks.scheduledStart),
            ne(tasks.status, "archived")
          )
        )
      )
    );

  const taskIds = taskRows.map((t) => t.id);

  // Fetch labels for those tasks
  let labelAssignmentsRows: { taskId: string; labelId: string }[] = [];
  let labelRows: TaskLabel[] = [];
  if (taskIds.length > 0) {
    labelAssignmentsRows = await db
      .select({
        taskId: taskLabelAssignments.taskId,
        labelId: taskLabelAssignments.labelId
      })
      .from(taskLabelAssignments)
      .where(taskLabelAssignments.taskId.in(taskIds));

    const labelIds = Array.from(
      new Set(labelAssignmentsRows.map((la) => la.labelId))
    );
    if (labelIds.length > 0) {
      labelRows = await db
        .select()
        .from(taskLabels)
        .where(taskLabels.id.in(labelIds));
    }
  }

  const labelById = new Map(labelRows.map((l) => [l.id, l]));
  const tasksWithLabels: TaskWithSubtasksAndLabels[] = taskRows.map((t) => {
    const labelsForTask = labelAssignmentsRows
      .filter((la) => la.taskId === t.id)
      .map((la) => labelById.get(la.labelId))
      .filter((l): l is TaskLabel => !!l);
    return {
      ...t,
      labels: labelsForTask
    };
  });

  return (
    <WeekPlannerPage
      weekId={weekId}
      start={start.toISOString()}
      end={end.toISOString()}
      calendars={calendarRows}
      events={eventRows}
      tasks={tasksWithLabels}
    />
  );
}