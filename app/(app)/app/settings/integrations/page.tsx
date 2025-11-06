import { db } from "@/lib/db/client";
import {
  integrations,
  integrationProviderEnum
} from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";

const ALL_PROVIDERS = integrationProviderEnum.enumValues;

type IntegrationRow = {
  id: string;
  provider: string;
  enabled: boolean;
};

function getLabelForProvider(provider: string): string {
  switch (provider) {
    case "notion":
      return "Notion";
    case "clickup":
      return "ClickUp";
    case "linear":
      return "Linear";
    case "todoist":
      return "Todoist";
    case "google_calendar":
      return "Google Calendar";
    case "outlook":
      return "Outlook";
    case "apple_calendar":
      return "Apple Calendar";
    case "fastmail":
      return "Fastmail";
    default:
      return provider;
  }
}

function getStatusLabel(
  provider: string,
  rowsByProvider: Map<string, IntegrationRow>
): "Not connected" | "Connected (mock)" {
  const row = rowsByProvider.get(provider);
  if (!row || !row.enabled) return "Not connected";
  return "Connected (mock)";
}

export default async function IntegrationsSettingsPage(): Promise<JSX.Element> {
  const session = await requireSession();
  const workspaceId = session.workspaceId;

  if (!workspaceId) {
    // App shell already enforces workspace; this is defensive.
    throw new Error("Workspace context required");
  }

  const rows = await db
    .select({
      id: integrations.id,
      provider: integrations.provider,
      enabled: integrations.enabled
    })
    .from(integrations)
    .where(integrations.workspaceId.eq(workspaceId));

  const rowsByProvider = new Map<string, IntegrationRow>();
  for (const row of rows) {
    rowsByProvider.set(row.provider, row);
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          Settings
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          Integrations
        </h1>
        <p className="mt-1 text-xs text-muted-foreground max-w-xl">
          Preview of external providers wired through the Dayflow Polaris
          integrations layer. All entries are mock-only in this step; no real
          external calls are made.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_PROVIDERS.map((provider) => {
          const label = getLabelForProvider(provider);
          const status = getStatusLabel(provider, rowsByProvider);
          return (
            <div
              key={provider}
              className="flex flex-col justify-between rounded-lg border border-border/70 bg-background/80 p-3"
            >
              <div>
                <div className="text-sm font-medium text-foreground">
                  {label}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                  {provider}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Status:{" "}
                  <span className="font-medium">
                    {status}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground/80">
                  Mock-only for Step 4. OAuth and real sync flows will be added
                  later.
                </div>
              </div>
              <div className="mt-3 flex">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full justify-center text-[11px]"
                >
                  Connect (coming soon)
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}