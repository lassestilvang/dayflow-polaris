import type { IntegrationConnector } from "./base";
import type { ExternalEvent, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "fastmail";

function makeMockEvents(
  workspaceId: string,
  range: { start: Date; end: Date }
): ExternalEvent[] {
  const startISO = range.start.toISOString();

  return [
    {
      id: `${provider}-${workspaceId}-event-1`,
      title: "Fastmail: Mock calendar block",
      start: startISO,
      end: startISO,
      allDay: false,
      source: provider,
      calendarName: "Fastmail"
    }
  ];
}

export const fastmailConnector: IntegrationConnector = {
  provider,
  async listExternalEvents(
    workspaceId: string,
    range: { start: Date; end: Date }
  ): Promise<ExternalEvent[]> {
    return makeMockEvents(workspaceId, range);
  }
};