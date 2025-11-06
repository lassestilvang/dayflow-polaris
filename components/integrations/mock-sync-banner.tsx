"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ExternalTask = {
  id: string;
  title: string;
  completed: boolean;
  due?: string | null;
  source: string;
  url?: string | null;
};

type ExternalEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  source: string;
  calendarName?: string | null;
};

type MockSyncResponse = {
  tasks: ExternalTask[];
  events: ExternalEvent[];
  meta?: {
    weekId?: string;
    range?: {
      start: string;
      end: string;
    };
    note?: string;
  };
};

export function MockSyncBanner(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [tasksCount, setTasksCount] = useState<number | null>(null);
  const [eventsCount, setEventsCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/mock-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          includeTasks: true,
          includeEvents: true
        })
      });

      if (!res.ok) {
        setError("Failed to load mock integrations");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as MockSyncResponse;
      setTasksCount(data.tasks?.length ?? 0);
      setEventsCount(data.events?.length ?? 0);
    } catch {
      setError("Failed to load mock integrations");
    } finally {
      setLoading(false);
    }
  };

  const hasLoaded = tasksCount !== null || eventsCount !== null;

  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-[10px] text-muted-foreground/90">
      <div className="flex flex-col">
        <span className="font-semibold uppercase tracking-[0.16em] text-xs text-muted-foreground/80">
          Mock external sources
        </span>
        <span className="text-[10px] text-muted-foreground/80">
          Load deterministic mock tasks and events from integrations scaffolding.
          No real external calls are made.
        </span>
        {hasLoaded && (
          <span className="mt-1 text-[10px] text-foreground/80">
            Loaded {tasksCount ?? 0} external task(s) and{" "}
            {eventsCount ?? 0} external event(s) from mock providers.
          </span>
        )}
        {error && (
          <span className="mt-1 text-[10px] text-destructive">
            {error}
          </span>
        )}
      </div>
      <div className="ml-auto">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleLoad}
          disabled={loading}
          className="h-7 px-2 text-[10px]"
        >
          {loading ? "Loading…" : hasLoaded ? "Reload mock data" : "Load mock integrations"}
        </Button>
      </div>
    </div>
  );
}