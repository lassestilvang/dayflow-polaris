import { integrationProviderEnum } from "../db/schema";

export type IntegrationProvider = (typeof integrationProviderEnum.enumValues)[number];

export type ExternalTask = {
  id: string;
  title: string;
  completed: boolean;
  due?: string | null;
  source: IntegrationProvider;
  url?: string | null;
};

export type ExternalEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  source: IntegrationProvider;
  calendarName?: string | null;
};

export type IntegrationAccountSummary = {
  id: string;
  provider: IntegrationProvider;
  workspaceId: string;
  label: string;
  status: "connected" | "error" | "disconnected";
};

export type SyncDirection = "pull" | "push" | "bidirectional";