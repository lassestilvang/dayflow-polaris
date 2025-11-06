import type {
  ExternalEvent,
  ExternalTask,
  IntegrationProvider
} from "./types";
import type { IntegrationConnector, IntegrationRegistry } from "./base";
import { setIntegrationRegistry } from "./base";
import { notionConnector } from "./notion";
import { clickupConnector } from "./clickup";
import { linearConnector } from "./linear";
import { todoistConnector } from "./todoist";
import { googleCalendarConnector } from "./google-calendar";
import { outlookConnector } from "./outlook";
import { appleCalendarConnector } from "./apple-calendar";
import { fastmailConnector } from "./fastmail";



const registry: IntegrationRegistry = {
  notion: notionConnector,
  clickup: clickupConnector,
  linear: linearConnector,
  todoist: todoistConnector,
  google_calendar: googleCalendarConnector,
  outlook: outlookConnector,
  apple_calendar: appleCalendarConnector,
  fastmail: fastmailConnector
};

// Initialize the global registry used by getConnector in base.ts
setIntegrationRegistry(registry);

export function getConnector(
  provider: IntegrationProvider
): IntegrationConnector {
  const connector = registry[provider];
  if (!connector) {
    throw new Error(
      `[integrations] No connector registered for provider "${provider}".`
    );
  }
  return connector;
}

export async function listAllExternalTasks(
  workspaceId: string
): Promise<ExternalTask[]> {
  const tasks: ExternalTask[] = [];

  for (const connector of Object.values(registry)) {
    if (connector.listExternalTasks) {
      const items = await connector.listExternalTasks(workspaceId);
      tasks.push(...items);
    }
  }

  return tasks;
}

export async function listAllExternalEvents(
  workspaceId: string,
  range: { start: Date; end: Date }
): Promise<ExternalEvent[]> {
  const events: ExternalEvent[] = [];

  for (const connector of Object.values(registry)) {
    if (connector.listExternalEvents) {
      const items = await connector.listExternalEvents(workspaceId, range);
      events.push(...items);
    }
  }

  return events;
}