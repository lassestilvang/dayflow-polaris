"use client";

import { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Calendar, Event } from "@/lib/db/schema";
import type { TaskWithSubtasksAndLabels } from "@/app/(app)/app/week/[weekId]/week-planner-page";
import { getDayHours } from "@/lib/calendar/date-utils";
import { useCalendarStore } from "@/store/calendar";
import { scheduleTaskOnCalendar, moveEvent } from "@/app/(app)/app/week/[weekId]/actions";
import { useToastController } from "@/components/ui/toast";

type WeekViewGridProps = {
  weekId: string;
  start: string;
  end: string;
  calendars: Calendar[];
  events: Event[];
  tasks: TaskWithSubtasksAndLabels[];
};

type PositionedBlock = {
  id: string;
  type: "event" | "task";
  title: string;
  calendarColor: string;
  start: Date;
  end: Date;
};

const HOUR_START = 6;
const HOUR_END = 22; // exclusive

function buildPositionedBlocks(
  calendars: Calendar[],
  events: Event[],
  tasks: TaskWithSubtasksAndLabels[]
): PositionedBlock[] {
  const calendarById = new Map(calendars.map((c) => [c.id, c]));

  const blocks: PositionedBlock[] = [];

  for (const ev of events) {
    const cal = calendarById.get(ev.calendarId);
    blocks.push({
      id: ev.id,
      type: "event",
      title: ev.title,
      calendarColor: cal?.color ?? "#4f46e5",
      start: new Date(ev.start),
      end: new Date(ev.end)
    });
  }

  for (const task of tasks) {
    if (!task.scheduledStart || !task.scheduledEnd) continue;
    const cal = task.calendarId ? calendarById.get(task.calendarId) : null;
    blocks.push({
      id: task.id,
      type: "task",
      title: task.title,
      calendarColor: cal?.color ?? "#22c55e",
      start: new Date(task.scheduledStart),
      end: new Date(task.scheduledEnd)
    });
  }

  return blocks;
}

function getDayIndex(baseStart: Date, date: Date): number {
  const diffMs = date.getTime() - baseStart.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return diffDays;
}

function getHourOffset(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

function getCellDate(
  weekStart: Date,
  dayIndex: number,
  hour: number
): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIndex);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export default function WeekViewGrid({
  weekId,
  start,
  end,
  calendars,
  events,
  tasks
}: WeekViewGridProps): JSX.Element {
  const hours = useMemo(() => getDayHours().filter((h) => h >= HOUR_START && h <= HOUR_END), []);
  const weekStart = useMemo(() => new Date(start), [start]);
  const weekEnd = useMemo(() => new Date(end), [end]);
  const blocks = useMemo(
    () => buildPositionedBlocks(calendars, events, tasks),
    [calendars, events, tasks]
  );

  const { open, setOpen } = useToastController();
  const { dragItem, startDrag, endDrag, updateDropPreview } =
    useCalendarStore((s) => ({
      dragItem: s.dragItem,
      startDrag: s.startDrag,
      endDrag: s.endDrag,
      updateDropPreview: s.updateDropPreview
    }));

  const showError = useCallback(
    (message: string) => {
      // Minimal: toggle toast viewport; in future, replace with richer toasts.
      console.error(message);
      if (!open) setOpen(true);
    },
    [open, setOpen]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragItem) {
      e.preventDefault();
    }
  };

  const handleDropOnCell = async (
    e: React.DragEvent<HTMLDivElement>,
    dayIndex: number,
    hour: number
  ) => {
    e.preventDefault();
    const dtStart = getCellDate(weekStart, dayIndex, hour);
    const dtEnd = getCellDate(weekStart, dayIndex, hour + 1);

    if (!dragItem) return;

    if (!calendars.length) {
      showError("No calendars available in this workspace.");
      endDrag();
      return;
    }

    const primaryCalendar = calendars[0];

    if (dragItem.type === "task") {
      try {
        await scheduleTaskOnCalendar({
          taskId: dragItem.id,
          calendarId: primaryCalendar.id,
          start: dtStart.toISOString(),
          end: dtEnd.toISOString()
        });
      } catch (err) {
        showError("Unable to schedule task.");
      } finally {
        endDrag();
      }
    } else if (dragItem.type === "event") {
      const duration =
        blocks.find((b) => b.type === "event" && b.id === dragItem.id)
          ?.end.getTime() -
        blocks.find((b) => b.type === "event" && b.id === dragItem.id)
          ?.start.getTime() || 60 * 60 * 1000;

      const newEnd = new Date(dtStart.getTime() + duration);
      try {
        await moveEvent({
          eventId: dragItem.id,
          start: dtStart.toISOString(),
          end: newEnd.toISOString()
        });
      } catch (err) {
        showError("Unable to move event.");
      } finally {
        endDrag();
      }
    }
  };

  const now = new Date();
  const showNow =
    now >= weekStart && now < weekEnd;

  const nowDayIndex = getDayIndex(weekStart, now);
  const nowHourOffset = getHourOffset(now);
  const nowTopPct =
    ((nowHourOffset - HOUR_START) / (HOUR_END - HOUR_START + 1)) * 100;

  return (
    <div className="relative flex min-w-0 flex-1 flex-col border border-border/60 bg-background/80">
      <div className="grid grid-cols-8 border-b border-border/60 text-[10px] text-muted-foreground/80">
        <div className="px-2 py-1">UTC</div>
        {Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(weekStart);
          d.setDate(weekStart.getDate() + i);
          const label = d.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric"
          });
          return (
            <div
              key={i}
              className="px-2 py-1 text-center"
            >
              {label}
            </div>
          );
        })}
      </div>

      <div className="relative flex-1 overflow-y-auto">
        <div className="grid grid-cols-8">
          {/* Hour labels */}
          <div className="flex flex-col text-[9px] text-muted-foreground/60">
            {hours.map((h) => (
              <div
                key={h}
                className="flex h-10 items-start justify-end pr-1"
              >
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div
              key={dayIndex}
              className="relative flex flex-1 flex-col border-l border-border/10"
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-10 border-t border-border/5"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnCell(e, dayIndex, h)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Blocks layer */}
        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence initial={false}>
            {blocks.map((block) => {
              const dayIndex = getDayIndex(weekStart, block.start);
              if (dayIndex < 0 || dayIndex > 6) return null;

              const startOffset = getHourOffset(block.start);
              const endOffset = getHourOffset(block.end);
              const topPct =
                ((startOffset - HOUR_START) /
                  (HOUR_END - HOUR_START + 1)) *
                100;
              const heightPct =
                ((endOffset - startOffset) /
                  (HOUR_END - HOUR_START + 1)) *
                100;

              return (
                <motion.div
                  key={`${block.type}-${block.id}`}
                  layout
                  layoutId={`${block.type}-${block.id}`}
                  initial={{ opacity: 0.9, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="pointer-events-auto absolute z-20 overflow-hidden rounded-sm border border-border/60 bg-background/95 px-1.5 py-0.5 text-[9px] leading-snug text-foreground shadow-sm"
                  style={{
                    left: `${(dayIndex + 1) * (100 / 8)}%`,
                    width: `${100 / 8}%`,
                    top: `${topPct}%`,
                    height: `${Math.max(heightPct, 4)}%`,
                    borderLeft: `2px solid ${block.calendarColor}`
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData(
                      "application/x-dayflow-event-id",
                      block.id
                    );
                    startDrag({ type: block.type, id: block.id });
                  }}
                  onDragEnd={() => {
                    endDrag();
                  }}
                >
                  <div className="line-clamp-2 font-medium">
                    {block.title}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Now indicator */}
        {showNow && nowDayIndex >= 0 && nowDayIndex <= 6 && (
          <div
            className="pointer-events-none absolute z-10 flex items-center gap-1"
            style={{
              left: `calc(${(nowDayIndex + 1) * (100 / 8)}% + 2px)`,
              right: "2px",
              top: `${nowTopPct}%`
            }}
          >
            <div className="h-px flex-1 bg-red-500/60" />
          </div>
        )}
      </div>
    </div>
  );
}