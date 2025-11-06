import type { IntegrationConnector } from "./base";
import type { ExternalEvent, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "google_calendar";

function makeMockEvents(
  workspaceId: string,
  range: { start: Date; end: Date }
): ExternalEvent[] {
  const startISO = range.start.toISOString();
  const mid = new Date(range.start);
  mid.setDate(mid.getDate() + 1);
  const midISO = mid.toISOString();

  return [
    {
      id: `${provider}-${workspaceId}-event-1`,
      title: "Google Calendar: Mock weekly standup",
      start: startISO,
      end: startISO,
      allDay: false,
      source: provider,
      calendarName: "Mock Team"
    },
    {
      id: `${provider}-${workspaceId}-event-2`,
      title: "Google Calendar: Mock focus block",
      start: midISO,
      end: midISO,
      allDay: false,
      source: provider,
      calendarName: "Deep Work"
    }
  ];
}

export const googleCalendarConnector: IntegrationConnector = {
  provider,
  async listExternalEvents(
    workspaceId: string,
    range: { start: Date; end: Date }
  ): Promise<ExternalEvent[]> {
    return makeMockEvents(workspaceId, range);
  }
};