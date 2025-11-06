"use client";

import { useMemo } from "react";
import type { TaskWithSubtasksAndLabels } from "@/app/(app)/app/week/[weekId]/week-planner-page";
import { isOverdue } from "@/lib/tasks/overdue";
import TaskItem from "./task-item";

type TaskListProps = {
  tasks: TaskWithSubtasksAndLabels[];
};

type GroupKey =
  | "inbox"
  | "overdue"
  | "work"
  | "family"
  | "personal"
  | "travel";

const GROUP_LABELS: Record<GroupKey, string> = {
  inbox: "Inbox",
  overdue: "Overdue",
  work: "Work",
  family: "Family",
  personal: "Personal",
  travel: "Travel"
};

function hasLabel(task: TaskWithSubtasksAndLabels, name: string): boolean {
  const n = name.toLowerCase();
  return task.labels?.some((l) => l.name.toLowerCase() === n) ?? false;
}

function groupTasks(tasks: TaskWithSubtasksAndLabels[]) {
  const groups: Record<GroupKey, TaskWithSubtasksAndLabels[]> = {
    inbox: [],
    overdue: [],
    work: [],
    family: [],
    personal: [],
    travel: []
  };

  const now = new Date();

  for (const task of tasks) {
    const isArchived = task.status === "archived";
    const hasScheduled = !!task.scheduledStart || !!task.scheduledEnd;

    if (!isArchived && isOverdue(task.due ? new Date(task.due) : null, task.status, now)) {
      groups.overdue.push(task);
      continue;
    }

    if (!hasScheduled && !task.due && !isArchived) {
      groups.inbox.push(task);
    }

    if (hasLabel(task, "Work")) groups.work.push(task);
    if (hasLabel(task, "Family")) groups.family.push(task);
    if (hasLabel(task, "Personal")) groups.personal.push(task);
    if (hasLabel(task, "Travel")) groups.travel.push(task);
  }

  return groups;
}

export default function TaskList({ tasks }: TaskListProps): JSX.Element {
  const groups = useMemo(() => groupTasks(tasks), [tasks]);

  const orderedGroups: GroupKey[] = [
    "inbox",
    "overdue",
    "work",
    "family",
    "personal",
    "travel"
  ];

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      {orderedGroups.map((key) => {
        const groupTasks = groups[key];
        if (!groupTasks.length) return null;

        return (
          <section key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                {GROUP_LABELS[key]}
              </h2>
              <span className="text-[9px] text-muted-foreground/60">
                {groupTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {groupTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  due={task.due ? String(task.due) : null}
                  status={task.status}
                  labels={task.labels}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}