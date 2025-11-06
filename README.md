# Dayflow Polaris

Dayflow Polaris is a modern, production-grade daily planner built with:

- Next.js 16 (App Router)
- Bun
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Zustand
- Drizzle ORM + Neon (PostgreSQL)
- Upstash Redis
- WorkOS (SSO auth)
- View Transition API
- Vercel-ready deployment model

It provides a unified weekly planner that consolidates tasks, events, and (mocked) external integrations into a single, fast, professional interface.

## Features

- Authentication and multi-tenancy

  - WorkOS-based SSO (organization and user mapping).
  - Neon (Postgres) as primary datastore via Drizzle ORM.
  - Upstash Redis-backed sessions keyed by user and workspace.
  - Multi-tenant model:
    - Users, Workspaces, Memberships.

- Core planner UI

  - Authenticated app shell under `/app` (protected via `requireSession`).
  - Weekly view at `/app/week/[weekId]`:
    - Time-block calendar grid (Mon–Sun, hourly slots).
    - Sidebar task groups:
      - Inbox, Overdue, Work, Family, Personal, Travel.
    - Drag-and-drop:
      - Drag tasks from sidebar onto calendar to schedule.
      - Drag events within calendar to reschedule.
    - Conflict detection:
      - Utilities in [`lib/calendar/conflicts.ts`](lib/calendar/conflicts.ts:1) prevent overlaps in the same calendar.

- Integrations scaffold (mocked)

  - Strongly-typed integration abstraction in:
    - [`lib/integrations/types.ts`](lib/integrations/types.ts:1)
    - [`lib/integrations/base.ts`](lib/integrations/base.ts:1)
  - Mock connectors for:
    - Notion, ClickUp, Linear, Todoist
    - Google Calendar, Outlook, Apple Calendar, Fastmail
  - Central dispatcher:
    - [`lib/integrations/dispatcher.ts`](lib/integrations/dispatcher.ts:1)
    - Aggregates mock external tasks/events.
  - API endpoints:
    - [`app/api/integrations/list/route.ts`](app/api/integrations/list/route.ts:1)
    - [`app/api/integrations/mock-sync/route.ts`](app/api/integrations/mock-sync/route.ts:1)
  - UI:
    - Integrations settings at [`app/(app)/app/settings/integrations/page.tsx`](<app/(app)/app/settings/integrations/page.tsx:1>)
    - Weekly planner mock banner at [`components/integrations/mock-sync-banner.tsx`](components/integrations/mock-sync-banner.tsx:1)

- UI and UX
  - Dark-first theme with system-aware light/dark.
  - shadcn/ui primitives for consistent design language.
  - Framer Motion for subtle interactions and drag transitions.
  - View Transition API helper for smooth week navigation.
  - Responsive split layout: sidebar + main calendar.
  - Built to be extended with:
    - Collaboration features
    - Real integrations
    - Smart suggestions and natural language input
    - Recurring events

## Key Structure

App shell and routing:

- [`app/layout.tsx`](app/layout.tsx:1)
  - Root layout, global ThemeProvider, ToastProvider, dark theme baseline.
- [`app/(auth)/layout.tsx`](<app/(auth)/layout.tsx:1>)
  - Minimal auth layout.
- [`app/(auth)/signin/page.tsx`](<app/(auth)/signin/page.tsx:1>)
  - Sign-in placeholder; wired to WorkOS start endpoint.
- [`app/(app)/layout.tsx`](<app/(app)/layout.tsx:1>)
  - Protected app shell; wraps children with AppShell and `requireSession`.
- [`app/(app)/app/page.tsx`](<app/(app)/app/page.tsx:1>)
  - Redirects to current week: `/app/week/[weekId]`.
- [`app/(app)/app/week/[weekId]/page.tsx`](<app/(app)/app/week/[weekId]/page.tsx:1>)
  - Server: loads workspace calendars, events, tasks for a given week.
- [`app/(app)/app/week/[weekId]/week-planner-page.tsx`](<app/(app)/app/week/[weekId]/week-planner-page.tsx:1>)
  - Client: renders weekly planner header, sidebar, calendar grid, and integration banner.

Core components:

- Layout:
  - [`components/layout/app-shell.tsx`](components/layout/app-shell.tsx:1)
  - [`components/layout/top-nav.tsx`](components/layout/top-nav.tsx:1)
  - [`components/layout/sidebar.tsx`](components/layout/sidebar.tsx:1)
- Tasks:
  - [`components/tasks/task-list.tsx`](components/tasks/task-list.tsx:1)
  - [`components/tasks/task-item.tsx`](components/tasks/task-item.tsx:1)
- Calendar:
  - [`components/calendar/week-view-grid.tsx`](components/calendar/week-view-grid.tsx:1)
  - [`components/calendar/time-slot.tsx`](components/calendar/time-slot.tsx:1)
- Integrations:
  - [`components/integrations/mock-sync-banner.tsx`](components/integrations/mock-sync-banner.tsx:1)

Data and logic:

- Env:
  - [`lib/env.ts`](lib/env.ts:1)
- Database:
  - [`lib/db/schema.ts`](lib/db/schema.ts:1)
  - [`lib/db/client.ts`](lib/db/client.ts:1)
- Cache:
  - [`lib/cache/redis.ts`](lib/cache/redis.ts:1)
- Auth:
  - [`lib/auth/workos.ts`](lib/auth/workos.ts:1)
  - [`lib/auth/session.ts`](lib/auth/session.ts:1)
  - [`lib/auth/guards.ts`](lib/auth/guards.ts:1)
- Calendar and tasks:
  - [`lib/calendar/date-utils.ts`](lib/calendar/date-utils.ts:1)
  - [`lib/calendar/conflicts.ts`](lib/calendar/conflicts.ts:1)
  - [`lib/tasks/overdue.ts`](lib/tasks/overdue.ts:1)
- Integrations:
  - [`lib/integrations/types.ts`](lib/integrations/types.ts:1)
  - [`lib/integrations/base.ts`](lib/integrations/base.ts:1)
  - [`lib/integrations/dispatcher.ts`](lib/integrations/dispatcher.ts:1)
  - Mock connectors under `lib/integrations/*.ts`.

State:

- [`store/ui.ts`](store/ui.ts:1)
- [`store/calendar.ts`](store/calendar.ts:1)

## Getting Started

### 1. Install dependencies

From the project root:

```bash
bun install
```

### 2. Configure environment

Create a `.env.local` file in the project root (template below).

Mandatory for full auth + data stack:

- NEXT_PUBLIC_APP_URL
- DATABASE_URL
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN
- WORKOS_API_KEY
- WORKOS_CLIENT_ID
- WORKOS_REDIRECT_URI
- WORKOS_WEBHOOK_SECRET
- NODE_ENV

For local development you may use placeholder WORKOS values if you are not exercising SSO, but the WorkOS flows will only succeed with valid credentials.

### 3. Database migrations

Run Drizzle against your Neon/Postgres database:

```bash
bun run drizzle:generate
bun run drizzle:push
```

Confirm that `DATABASE_URL` is set and reachable.

### 4. Run the dev server

```bash
bun run dev
```

Key routes:

- `/`
  - Landing page.
- `/signin`
  - Sign-in UI, wired to WorkOS start endpoint.
- `/app`
  - Protected; redirects to `/app/week/[weekId]` when authenticated.
- `/app/week/[weekId]`
  - Main weekly planner:
    - Sidebar task groups.
    - Time-block calendar.
    - Drag-and-drop with conflict checks.
    - Mock external sync banner.
- `/app/settings/integrations`
  - Integrations overview (mock statuses).

### 5. Using the planner

- Authenticate via WorkOS (once configured) to access `/app`.
- Seed calendars/tasks/events using the database (or extend with creation forms).
- Drag tasks from the sidebar into the calendar to schedule.
- Drag events to reschedule; overlapping moves are rejected via conflict checks.
- Use the "Mock external sources" banner to load deterministic mock tasks/events from integrations.

## Notes

- This codebase is structured for:
  - Future collaboration (presence, shared events).
  - Real provider integrations (via the integration connectors).
  - Additional validation, error-handling, and test coverage.
- All external integration calls are mocked at this stage and safe to use in any environment.
- Keep `.env.local` out of version control.
