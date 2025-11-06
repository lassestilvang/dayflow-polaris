"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "../db/client";
import { sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { env, isDevAuthBypassEnabled } from "../env";
import { getJson, setJson, del as delKey } from "../cache/redis";

export interface Session {
  id: string;
  userId: string;
  workspaceId: string;
  createdAt: Date;
  expiresAt: Date;
}

const SESSION_COOKIE_NAME = "dayflow_session";

function getCookieDomain(): string | undefined {
  try {
    const url = new URL(env.NEXT_PUBLIC_APP_URL);
    return url.hostname === "localhost" ? undefined : url.hostname;
  } catch {
    return undefined;
  }
}

function getCookieSecure(): boolean {
  return env.NODE_ENV === "production";
}

export async function createSession(
  userId: string,
  workspaceId: string,
  ttlSeconds: number
): Promise<string> {
  const id = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  await db.insert(sessions).values({
    id,
    userId,
    workspaceId,
    createdAt: now,
    expiresAt
  });

  const payload = {
    userId,
    workspaceId,
    expiresAt: expiresAt.toISOString()
  };

  await setJson(`session:${id}`, payload, ttlSeconds);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, id, {
    httpOnly: true,
    secure: getCookieSecure(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    domain: getCookieDomain()
  });

  return id;
}

async function loadSessionFromDb(id: string): Promise<Session | null> {
  const rows = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) return null;

  return {
    id: row.id,
    userId: row.userId,
    workspaceId: row.workspaceId,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt
  };
}

function getDevBypassSession(): Session {
  const now = new Date();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  return {
    id: "dev-bypass-session",
    userId: "dev-user",
    workspaceId: "dev-workspace",
    createdAt: now,
    expiresAt: new Date(now.getTime() + oneYearMs)
  };
}

export async function getSession(): Promise<Session | null> {
  if (isDevAuthBypassEnabled) {
    return getDevBypassSession();
  }

  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!id) return null;

  // First, try Redis cache.
  const cached = await getJson<{
    userId: string;
    workspaceId: string;
    expiresAt: string;
  }>(`session:${id}`);

  if (cached) {
    const expiresAt = new Date(cached.expiresAt);
    if (expiresAt.getTime() > Date.now()) {
      return {
        id,
        userId: cached.userId,
        workspaceId: cached.workspaceId,
        createdAt: new Date(expiresAt.getTime() - 1000), // placeholder; DB has canonical
        expiresAt
      };
    }
  }

  // Fallback to DB for resilience.
  const fromDb = await loadSessionFromDb(id);
  if (!fromDb) {
    // Ensure stale cookie/cache are cleared.
    await deleteSession();
    return null;
  }

  // Repopulate Redis with remaining TTL.
  const ttlSeconds = Math.max(
    0,
    Math.floor((fromDb.expiresAt.getTime() - Date.now()) / 1000)
  );
  if (ttlSeconds > 0) {
    await setJson(
      `session:${fromDb.id}`,
      {
        userId: fromDb.userId,
        workspaceId: fromDb.workspaceId,
        expiresAt: fromDb.expiresAt.toISOString()
      },
      ttlSeconds
    );
  }

  return fromDb;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!id) return;

  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.id, id));

  await delKey(`session:${id}`);

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: getCookieSecure(),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    domain: getCookieDomain()
  });
}