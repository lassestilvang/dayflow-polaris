import type { IntegrationConnector } from "./base";
import type { ExternalTask, IntegrationProvider } from "./types";

const provider: IntegrationProvider = "linear";

function makeMockTasks(workspaceId: string): ExternalTask[] {
  return [
    {
      id: `${provider}-${workspaceId}-task-1`,
      title: "Linear: Mock issue triage",
      completed: false,
      due: null,
      source: provider,
      url: "https://linear.app/example/mock-issue"
    }
  ];
}

export const linearConnector: IntegrationConnector = {
  provider,
  async listExternalTasks(workspaceId: string): Promise<ExternalTask[]> {
    return makeMockTasks(workspaceId);
  }
};