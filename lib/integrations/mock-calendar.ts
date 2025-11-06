import type { IntegrationConnector } from "./base";
import type { ExternalEvent, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "google_calendar";

/**
 * Deprecated: this file is kept only if referenced accidentally.
 * Use google-calendar.ts instead. No real logic here.
 */

export const mockCalendarConnector: IntegrationConnector = {
  provider,
  async listExternalEvents(
    workspaceId: string,
    range: { start: Date; end: Date }
  ): Promise<ExternalEvent[]> {
    const startISO = range.start.toISOString();
    return [
      {
        id: `${provider}-${workspaceId}-deprecated-event-1`,
        title: "Deprecated mock event",
        start: startISO,
        end: startISO,
        allDay: false,
        source: provider,
        calendarName: "Deprecated"
      }
    ];
  }
};