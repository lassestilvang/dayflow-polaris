import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  index,
  uniqueIndex,
  pgEnum,
  jsonb
} from "drizzle-orm/pg-core";

// Users represent human identities authenticated via WorkOS or future providers.
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    workosUserId: varchar("workos_user_id", { length: 255 }),
    name: varchar("name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    workosUserIdUnique: uniqueIndex("users_workos_user_id_unique").on(
      table.workosUserId
    )
  })
);

// Workspaces are multi-tenant containers (org or personal).
export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    // Optional: link to WorkOS org or future providers.
    workosOrgId: varchar("workos_org_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    slugUnique: uniqueIndex("workspaces_slug_unique").on(table.slug)
  })
);

// Memberships link users to workspaces with basic role semantics (future use).
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 64 }).default("member").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    membershipUnique: uniqueIndex("memberships_user_workspace_unique").on(
      table.userId,
      table.workspaceId
    ),
    workspaceIdx: index("memberships_workspace_id_idx").on(table.workspaceId)
  })
);

// Sessions stored in Postgres for durability; mirrored in Redis for fast lookup.
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true })
  },
  (table) => ({
    userIdx: index("sessions_user_id_idx").on(table.userId),
    workspaceIdx: index("sessions_workspace_id_idx").on(table.workspaceId)
  })
);

// Integrations: high-level configuration per workspace (skeleton for future use).
export const integrations = pgTable(
  "integrations",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    config: text("config"), // JSON string; parsed at usage sites later.
    enabled: boolean("enabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    workspaceProviderUnique: uniqueIndex(
      "integrations_workspace_provider_unique"
    ).on(table.workspaceId, table.provider),
    workspaceIdx: index("integrations_workspace_id_idx").on(table.workspaceId)
  })
);

 // Integration accounts: per-user credentials/links for integrations (skeleton).
export const integrationAccounts = pgTable(
  "integration_accounts",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    externalAccountId: varchar("external_account_id", { length: 255 }).notNull(),
    // Secure storage of credentials/tokens will be handled by providers later.
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    userWorkspaceProviderIdx: index(
      "integration_accounts_user_workspace_provider_idx"
    ).on(table.userId, table.workspaceId, table.provider)
  })
);

// Planner-related enums
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
  "archived"
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent"
]);

export const eventAttendeeStatusEnum = pgEnum("event_attendee_status", [
  "invited",
  "accepted",
  "declined",
  "tentative"
]);

export const eventAttendeeRoleEnum = pgEnum("event_attendee_role", [
  "required",
  "optional"
]);

export const integrationProviderEnum = pgEnum("integration_provider", [
  "notion",
  "clickup",
  "linear",
  "todoist",
  "google_calendar",
  "outlook",
  "apple_calendar",
  "fastmail"
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "local",
  "notion",
  "clickup",
  "linear",
  "todoist"
]);

// Calendars
export const calendars = pgTable(
  "calendars",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    external: boolean("external").notNull().default(false),
    provider: integrationProviderEnum("provider"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    workspaceIdx: index("calendars_workspace_id_idx").on(table.workspaceId)
  })
);

// Events
export const events = pgTable(
  "events",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    calendarId: uuid("calendar_id")
      .notNull()
      .references(() => calendars.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    start: timestamp("start", { withTimezone: true }).notNull(),
    end: timestamp("end", { withTimezone: true }).notNull(),
    allDay: boolean("all_day").notNull().default(false),
    recurrenceRuleId: uuid("recurrence_rule_id"),
    isLocked: boolean("is_locked").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    workspaceCalendarStartIdx: index(
      "events_workspace_calendar_start_idx"
    ).on(table.workspaceId, table.calendarId, table.start),
    workspaceRangeIdx: index("events_workspace_start_end_idx").on(
      table.workspaceId,
      table.start,
      table.end
    )
  })
);

// Event attendees
export const eventAttendees = pgTable(
  "event_attendees",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    email: text("email").notNull(),
    status: eventAttendeeStatusEnum("status").notNull(),
    role: eventAttendeeRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    eventIdx: index("event_attendees_event_id_idx").on(table.eventId),
    userIdx: index("event_attendees_user_id_idx").on(table.userId)
  })
);

// Tasks
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    due: timestamp("due", { withTimezone: true }),
    scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),
    calendarId: uuid("calendar_id").references(() => calendars.id, {
      onDelete: "set null"
    }),
    parentTaskId: uuid("parent_task_id").references(() => tasks.id, {
      onDelete: "set null"
    }),
    source: sourceTypeEnum("source").notNull().default("local"),
    sourceItemId: text("source_item_id"),
    isSynced: boolean("is_synced").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    workspaceStatusDueIdx: index(
      "tasks_workspace_status_due_idx"
    ).on(table.workspaceId, table.status, table.due),
    workspaceScheduledStartIdx: index(
      "tasks_workspace_scheduled_start_idx"
    ).on(table.workspaceId, table.scheduledStart),
    sourceItemUnique: uniqueIndex("tasks_source_source_item_unique").on(
      table.source,
      table.sourceItemId
    )
  })
);

// Subtasks
export const subtasks = pgTable(
  "subtasks",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: taskStatusEnum("status").notNull().default("todo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  }
);

// Task labels
export const taskLabels = pgTable(
  "task_labels",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    workspaceNameUnique: uniqueIndex(
      "task_labels_workspace_name_unique"
    ).on(table.workspaceId, table.name)
  })
);

// Task label assignments (many-to-many)
export const taskLabelAssignments = pgTable(
  "task_label_assignments",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: uuid("label_id")
      .notNull()
      .references(() => taskLabels.id, { onDelete: "cascade" })
  },
  (table) => ({
    pk: uniqueIndex("task_label_assignments_pk").on(table.taskId, table.labelId)
  })
);

// Synced items (skeleton for future integrations)
export const syncedItems = pgTable(
  "synced_items",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    integrationId: uuid("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    provider: integrationProviderEnum("provider").notNull(),
    externalId: text("external_id").notNull(),
    localType: varchar("local_type", { length: 16 }).notNull(), // "task" | "event"
    localId: uuid("local_id").notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    syncState: jsonb("sync_state").notNull().default("{}")
  },
  (table) => ({
    integrationExternalUnique: uniqueIndex(
      "synced_items_integration_external_unique"
    ).on(table.integrationId, table.externalId)
  })
);

export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type Calendar = typeof calendars.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Subtask = typeof subtasks.$inferSelect;
export type TaskLabel = typeof taskLabels.$inferSelect;