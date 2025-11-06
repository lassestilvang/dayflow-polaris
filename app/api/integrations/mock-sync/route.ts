import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { getWeekRangeFromWeekId, getWeekId } from "@/lib/calendar/date-utils";
import {
  listAllExternalEvents,
  listAllExternalTasks
} from "@/lib/integrations/dispatcher";
import type { ExternalEvent, ExternalTask } from "@/lib/integrations/types";

type MockSyncRequest = {
  includeEvents?: boolean;
  includeTasks?: boolean;
};

export async function POST(req: Request): Promise<NextResponse> {
  const session = await requireSession();
  const workspaceId = session.workspaceId;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "Workspace context required" },
      { status: 400 }
    );
  }

  let includeEvents = true;
  let includeTasks = true;

  try {
    const body = (await req.json()) as MockSyncRequest | null;
    if (body) {
      if (typeof body.includeEvents === "boolean") {
        includeEvents = body.includeEvents;
      }
      if (typeof body.includeTasks === "boolean") {
        includeTasks = body.includeTasks;
      }
    }
  } catch {
    // Ignore invalid JSON; fall back to defaults.
  }

  const now = new Date();
  const currentWeekId = getWeekId(now);
  const { start, end } = getWeekRangeFromWeekId(currentWeekId);

  let tasks: ExternalTask[] = [];
  let events: ExternalEvent[] = [];

  if (includeTasks) {
    tasks = await listAllExternalTasks(workspaceId);
  }

  if (includeEvents) {
    events = await listAllExternalEvents(workspaceId, { start, end });
  }

  return NextResponse.json({
    tasks,
    events,
    meta: {
      workspaceId,
      weekId: currentWeekId,
      range: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      note:
        "Mock data only. No external network calls performed. This is a scaffold for future real sync."
    }
  });
}