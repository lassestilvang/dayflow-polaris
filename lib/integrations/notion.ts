import type { IntegrationConnector } from "./base";
import type { ExternalTask, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "notion";

function makeMockTasks(workspaceId: string): ExternalTask[] {
  return [
    {
      id: `${provider}-${workspaceId}-task-1`,
      title: "Notion: Weekly planning doc review",
      completed: false,
      due: null,
      source: provider,
      url: "https://example.notion.so/mock-weekly-doc"
    },
    {
      id: `${provider}-${workspaceId}-task-2`,
      title: "Notion: Align goals for this week",
      completed: false,
      due: null,
      source: provider,
      url: "https://example.notion.so/mock-goals"
    },
    {
      id: `${provider}-${workspaceId}-task-3`,
      title: "Notion: Archive last week's notes",
      completed: true,
      due: null,
      source: provider,
      url: "https://example.notion.so/mock-archive"
    }
  ];
}

export const notionConnector: IntegrationConnector = {
  provider,
  async listExternalTasks(workspaceId: string): Promise<ExternalTask[]> {
    return makeMockTasks(workspaceId);
  }
};