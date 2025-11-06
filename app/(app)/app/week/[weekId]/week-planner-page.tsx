"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Calendar,
  Event,
  Task,
  TaskLabel
} from "@/lib/db/schema";
import { getWeekRangeFromWeekId, getWeekId } from "@/lib/calendar/date-utils";
import { withViewTransition } from "@/lib/view-transitions";
import { useCalendarStore } from "@/store/calendar";
import WeekViewGrid from "@/components/calendar/week-view-grid";
import TaskList from "@/components/tasks/task-list";
import { MockSyncBanner } from "@/components/integrations/mock-sync-banner";

export type TaskWithSubtasksAndLabels = Task & {
  labels: TaskLabel[];
};

interface WeekPlannerPageProps {
  weekId: string;
  start: string;
  end: string;
  calendars: Calendar[];
  events: Event[];
  tasks: TaskWithSubtasksAndLabels[];
}

function formatWeekLabel(weekId: string): string {
  const { start, end } = getWeekRangeFromWeekId(weekId);
  const startFmt = start.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric"
  });
  const endFmt = end.toLocaleDateString(undefined, {
    month: start.getMonth() === end.getMonth() ? undefined : "long",
    day: "numeric"
  });
  return `${startFmt} – ${endFmt}`;
}

function shiftWeek(weekId: string, delta: number): string {
  const { start } = getWeekRangeFromWeekId(weekId);
  const shifted = new Date(start);
  shifted.setDate(shifted.getDate() + delta * 7);
  return getWeekId(shifted);
}

export default function WeekPlannerPage({
  weekId,
  start,
  end,
  calendars,
  events,
  tasks
}: WeekPlannerPageProps): JSX.Element {
  const router = useRouter();
  const setActiveWeek = useCalendarStore((s) => s.setActiveWeek);

  useMemo(() => {
    setActiveWeek(weekId);
  }, [setActiveWeek, weekId]);

  const weekLabel = useMemo(() => formatWeekLabel(weekId), [weekId]);

  const handleNavigate = (targetWeekId: string) => {
    if (targetWeekId === weekId) return;
    withViewTransition(router, { href: `/app/week/${targetWeekId}` });
  };

  const handleToday = () => {
    const currentWeekId = getWeekId(new Date());
    handleNavigate(currentWeekId);
  };

  const handlePrev = () => {
    handleNavigate(shiftWeek(weekId, -1));
  };

  const handleNext = () => {
    handleNavigate(shiftWeek(weekId, 1));
  };

  const startISO = start;
  const endISO = end;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Weekly Planner
          </div>
          <AnimatePresence mode="wait">
            <motion.h1
              key={weekId}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              {weekLabel}
            </motion.h1>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-md border border-border/80 px-2 py-1 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-md border border-border/80 px-3 py-1 text-xs text-foreground bg-muted/40 hover:bg-muted/70"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md border border-border/80 px-2 py-1 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <aside className="flex w-64 flex-col gap-3 border-r border-border/60 pr-3">
          <TaskList tasks={tasks} />
        </aside>
        <section className="flex min-w-0 flex-1">
          <WeekViewGrid
            weekId={weekId}
            start={startISO}
            end={endISO}
            calendars={calendars}
            events={events}
            tasks={tasks}
          />
        </section>
      </div>
    </div>
  );
}