import type { IntegrationConnector } from "./base";
import type { ExternalTask, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "clickup";

function makeMockTasks(workspaceId: string): ExternalTask[] {
  return [
    {
      id: `${provider}-${workspaceId}-task-1`,
      title: "ClickUp: Mock sprint task",
      completed: false,
      due: null,
      source: provider,
      url: "https://example.clickup.com/mock-sprint"
    }
  ];
}

export const clickupConnector: IntegrationConnector = {
  provider,
  async listExternalTasks(workspaceId: string): Promise<ExternalTask[]> {
    return makeMockTasks(workspaceId);
  }
};