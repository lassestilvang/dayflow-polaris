"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { TaskLabel } from "@/lib/db/schema";
import { isOverdue } from "@/lib/tasks/overdue";
import { useCalendarStore } from "@/store/calendar";

export type TaskItemProps = {
  id: string;
  title: string;
  due: string | null;
  status: "todo" | "in_progress" | "done" | "archived";
  labels: TaskLabel[];
};

function getDueBadge(due: string | null, status: TaskItemProps["status"]) {
  if (!due) return null;
  const dueDate = new Date(due);
  const overdue = isOverdue(dueDate, status);
  const label = dueDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });

  return (
    <span
      className={
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] font-medium " +
        (overdue
          ? "bg-red-500/10 text-red-400"
          : "bg-muted/40 text-muted-foreground/80")
      }
    >
      {overdue ? "Overdue · " : ""}
      {label}
    </span>
  );
}

function getLabelPills(labels: TaskLabel[]) {
  if (!labels?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <span
          key={label.id}
          className="inline-flex items-center rounded-sm bg-muted/40 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-muted-foreground/80"
          style={{
            borderColor: label.color ?? "transparent"
          }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}

function RawTaskItem({
  id,
  title,
  due,
  status,
  labels
}: TaskItemProps): JSX.Element {
  const startDrag = useCalendarStore((s) => s.startDrag);
  const endDrag = useCalendarStore((s) => s.endDrag);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-dayflow-task-id", id);
    startDrag({ type: "task", id });
  };

  const handleDragEnd = () => {
    endDrag();
  };

  const dueBadge = getDueBadge(due, status);
  const labelPills = getLabelPills(labels);

  return (
    <motion.div
      layout
      layoutId={`task-${id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-task-id={id}
      className="group flex cursor-grab flex-col gap-1 rounded-md border border-border/50 bg-background/80 px-2 py-1.5 text-xs text-foreground shadow-sm transition-colors hover:border-border hover:bg-background"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="line-clamp-2 font-medium text-foreground">
          {title}
        </div>
        {dueBadge}
      </div>
      {labelPills}
    </motion.div>
  );
}

const TaskItem = memo(RawTaskItem);
TaskItem.displayName = "TaskItem";

export default TaskItem;