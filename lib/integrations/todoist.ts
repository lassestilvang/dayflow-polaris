import type { IntegrationConnector } from "./base";
import type { ExternalTask, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "todoist";

function makeMockTasks(workspaceId: string): ExternalTask[] {
  return [
    {
      id: `${provider}-${workspaceId}-task-1`,
      title: "Todoist: Mock inbox zero",
      completed: false,
      due: null,
      source: provider,
      url: "https://todoist.com/showProject?id=mock"
    }
  ];
}

export const todoistConnector: IntegrationConnector = {
  provider,
  async listExternalTasks(workspaceId: string): Promise<ExternalTask[]> {
    return makeMockTasks(workspaceId);
  }
};