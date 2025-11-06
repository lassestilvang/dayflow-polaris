"use server";

import { db } from "@/lib/db/client";
import {
  events,
  tasks,
  calendars
} from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/guards";
import { hasConflict, type TimeRange } from "@/lib/calendar/conflicts";
import { and, ne, eq, gte, lt } from "drizzle-orm";

type ScheduleTaskInput = {
  taskId: string;
  calendarId: string;
  start: string;
  end: string;
};

type MoveEventInput = {
  eventId: string;
  start: string;
  end: string;
};

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

function toRange(start: string, end: string): TimeRange | null {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
    return null;
  }
  return { start: s, end: e };
}

export async function scheduleTaskOnCalendar(
  input: ScheduleTaskInput
): Promise<ActionResult> {
  const { taskId, calendarId, start, end } = input;
  const session = await requireSession();
  const { workspaceId } = session;

  if (!workspaceId) {
    return { ok: false, error: "Workspace not found in session" };
  }

  const range = toRange(start, end);
  if (!range) {
    return { ok: false, error: "Invalid time range" };
  }

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .limit(1);

  if (!task) {
    return { ok: false, error: "Task not found" };
  }

  const [calendar] = await db
    .select()
    .from(calendars)
    .where(and(eq(calendars.id, calendarId), eq(calendars.workspaceId, workspaceId)))
    .limit(1);

  if (!calendar) {
    return { ok: false, error: "Calendar not found" };
  }

  const existingEvents = await db
    .select({
      start: events.start,
      end: events.end
    })
    .from(events)
    .where(
      and(
        eq(events.workspaceId, workspaceId),
        eq(events.calendarId, calendarId),
        gte(events.start, range.start),
        lt(events.start, range.end)
      )
    );

  const eventRanges: TimeRange[] = existingEvents.map((e) => ({
    start: e.start,
    end: e.end
  }));

  if (hasConflict(range, eventRanges)) {
    return { ok: false, error: "Time conflict with existing events" };
  }

  await db
    .update(tasks)
    .set({
      calendarId,
      scheduledStart: range.start,
      scheduledEnd: range.end
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)));

  return { ok: true };
}

export async function moveEvent(
  input: MoveEventInput
): Promise<ActionResult> {
  const { eventId, start, end } = input;
  const session = await requireSession();
  const { workspaceId } = session;

  if (!workspaceId) {
    return { ok: false, error: "Workspace not found in session" };
  }

  const range = toRange(start, end);
  if (!range) {
    return { ok: false, error: "Invalid time range" };
  }

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.workspaceId, workspaceId)))
    .limit(1);

  if (!event) {
    return { ok: false, error: "Event not found" };
  }

  const existingEvents = await db
    .select({
      id: events.id,
      start: events.start,
      end: events.end
    })
    .from(events)
    .where(
      and(
        eq(events.workspaceId, workspaceId),
        eq(events.calendarId, event.calendarId),
        ne(events.id, eventId),
        gte(events.start, range.start),
        lt(events.start, range.end)
      )
    );

  const ranges: TimeRange[] = existingEvents.map((e) => ({
    start: e.start,
    end: e.end
  }));

  if (hasConflict(range, ranges)) {
    return { ok: false, error: "Time conflict with existing events" };
  }

  await db
    .update(events)
    .set({
      start: range.start,
      end: range.end
    })
    .where(and(eq(events.id, eventId), eq(events.workspaceId, workspaceId)));

  return { ok: true };
}