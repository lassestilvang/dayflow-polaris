export type TaskStatus = "todo" | "in_progress" | "done" | "archived";

/**
 * Returns true when a task is overdue.
 *
 * A task is overdue if:
 * - it has a non-null due date, and
 * - the current time is strictly greater than the due date, and
 * - its status is not "done" or "archived".
 */
export function isOverdue(
  due: Date | null,
  status: TaskStatus,
  now: Date = new Date()
): boolean {
  if (!due) return false;
  if (status === "done" || status === "archived") return false;

  return now.getTime() > due.getTime();
}