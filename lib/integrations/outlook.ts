import type { IntegrationConnector } from "./base";
import type { ExternalEvent, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "outlook";

function makeMockEvents(
  workspaceId: string,
  range: { start: Date; end: Date }
): ExternalEvent[] {
  const startISO = range.start.toISOString();

  return [
    {
      id: `${provider}-${workspaceId}-event-1`,
      title: "Outlook: Mock 1:1",
      start: startISO,
      end: startISO,
      allDay: false,
      source: provider,
      calendarName: "Mock Work"
    }
  ];
}

export const outlookConnector: IntegrationConnector = {
  provider,
  async listExternalEvents(
    workspaceId: string,
    range: { start: Date; end: Date }
  ): Promise<ExternalEvent[]> {
    return makeMockEvents(workspaceId, range);
  }
};