import type { IntegrationConnector } from "./base";
import type { ExternalEvent, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "apple_calendar";

function makeMockEvents(
  workspaceId: string,
  range: { start: Date; end: Date }
): ExternalEvent[] {
  const startISO = range.start.toISOString();

  return [
    {
      id: `${provider}-${workspaceId}-event-1`,
      title: "Apple Calendar: Mock personal event",
      start: startISO,
      end: startISO,
      allDay: false,
      source: provider,
      calendarName: "Personal"
    }
  ];
}

export const appleCalendarConnector: IntegrationConnector = {
  provider,
  async listExternalEvents(
    workspaceId: string,
    range: { start: Date; end: Date }
  ): Promise<ExternalEvent[]> {
    return makeMockEvents(workspaceId, range);
  }
};