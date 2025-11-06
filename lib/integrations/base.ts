import type {
  ExternalEvent,
  ExternalTask,
  IntegrationProvider
} from "./types";

export interface IntegrationConnector {
  provider: IntegrationProvider;

  /**
   * Optional: return an authorization URL for starting an OAuth / connect flow.
   * For Step 4 this is unused and should remain a pure placeholder.
   */
  getAuthorizationUrl?(
    workspaceId: string,
    returnTo?: string
  ): Promise<string>;

  /**
   * Optional: handle OAuth callback parameters.
   * For Step 4 this is a no-op placeholder to keep the interface future-proof.
   */
  handleOAuthCallback?(params: URLSearchParams): Promise<void>;

  /**
   * Optional: list external tasks visible to this workspace.
   * Implemented by task-oriented providers in mock connectors.
   */
  listExternalTasks?(workspaceId: string): Promise<ExternalTask[]>;

  /**
   * Optional: list external events visible to this workspace in a given range.
   * Implemented by calendar providers in mock connectors.
   */
  listExternalEvents?(
    workspaceId: string,
    range: { start: Date; end: Date }
  ): Promise<ExternalEvent[]>;

  /**
   * Optional: synchronize external data into local models.
   * Left unimplemented for Step 4; real sync will live behind this hook.
   */
  syncIntoLocal?(workspaceId: string): Promise<void>;
}

export type IntegrationRegistry = Record<IntegrationProvider, IntegrationConnector>;

/**
 * The actual registry is defined in ./dispatcher to avoid circular dependencies.
 * This placeholder implementation is overridden there and exists only to provide
 * a typed helper for consumers.
 */
let activeRegistry: IntegrationRegistry | null = null;

export function setIntegrationRegistry(registry: IntegrationRegistry): void {
  activeRegistry = registry;
}

export function getConnector(provider: IntegrationProvider): IntegrationConnector {
  if (!activeRegistry) {
    throw new Error(
      `[integrations] Registry not initialized. Ensure dispatcher is imported before using getConnector().`
    );
  }
  const connector = activeRegistry[provider];
  if (!connector) {
    throw new Error(
      `[integrations] No connector registered for provider "${provider}".`
    );
  }
  return connector;
}