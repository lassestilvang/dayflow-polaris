import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../../lib/db/client";
import {
  users,
  workspaces,
  memberships
} from "../../../../../lib/db/schema";
import { createSession } from "../../../../../lib/auth/session";
import { getWorkOS } from "../../../../../lib/auth/workos";
import { env } from "../../../../../lib/env";

const STATE_COOKIE_NAME = "dayflow_workos_state";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect("/signin");
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(STATE_COOKIE_NAME)?.value;

  if (!storedState || storedState !== state) {
    // Clear potentially compromised state cookie.
    cookieStore.set(STATE_COOKIE_NAME, "", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0)
    });
    return NextResponse.redirect("/signin");
  }

  // Invalidate the state cookie after use.
  cookieStore.set(STATE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });

  const workos = getWorkOS();

  let profileAndOrg:
    | {
        profile: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
        };
        organization?: {
          id: string;
          name: string;
        } | null;
      }
    | null = null;

  try {
    // Using the official SDK for clarity; adjust method if WorkOS API changes.
    const result = await workos.sso.getProfileAndToken({ code });

    const email =
      result.profile.email ?? result.profile.raw_attributes?.email ?? null;

    profileAndOrg = {
      profile: {
        id: result.profile.id,
        email,
        first_name:
          (result.profile as any).first_name ??
          result.profile.raw_attributes?.given_name ??
          null,
        last_name:
          (result.profile as any).last_name ??
          result.profile.raw_attributes?.family_name ??
          null
      },
      organization:
        (result as any).organization ??
        (result as any).organization_profile ??
        null
    };
  } catch {
    return NextResponse.redirect("/signin");
  }

  if (!profileAndOrg) {
    return NextResponse.redirect("/signin");
  }

  const { profile, organization } = profileAndOrg;

  if (!profile.email) {
    return NextResponse.redirect("/signin");
  }

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Upsert user
  const existingUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.workosUserId, profile.id),
        eq(users.email, profile.email.toLowerCase())
      )
    )
    .limit(1);

  let userId: string;

  if (existingUsers[0]) {
    const existing = existingUsers[0];
    userId = existing.id;
    await db
      .update(users)
      .set({
        name: fullName || existing.name,
        updatedAt: new Date()
      })
      .where(eq(users.id, existing.id));
  } else {
    const inserted = await db
      .insert(users)
      .values({
        email: profile.email.toLowerCase(),
        workosUserId: profile.id,
        name: fullName || profile.email,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning({ id: users.id });
    userId = inserted[0].id;
  }

  // Determine / upsert workspace
  let workspaceId: string;
  if (organization?.id) {
    const slugBase = organization.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    const slug = slugBase || `org-${organization.id}`;
    const existingWs = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.workosOrgId, organization.id))
      .limit(1);

    if (existingWs[0]) {
      workspaceId = existingWs[0].id;
    } else {
      const created = await db
        .insert(workspaces)
        .values({
          name: organization.name,
          slug,
          workosOrgId: organization.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning({ id: workspaces.id });
      workspaceId = created[0].id;
    }
  } else {
    // Personal workspace fallback: one per user.
    const slug = profile.email.toLowerCase();
    const existingWs = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);

    if (existingWs[0]) {
      workspaceId = existingWs[0].id;
    } else {
      const created = await db
        .insert(workspaces)
        .values({
          name: fullName || profile.email,
          slug,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning({ id: workspaces.id });
      workspaceId = created[0].id;
    }
  }

  // Ensure membership
  const existingMembership = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!existingMembership[0]) {
    await db.insert(memberships).values({
      userId,
      workspaceId,
      role: "member",
      createdAt: new Date()
    });
  }

  // Create session (sets cookie + Redis + DB)
  await createSession(userId, workspaceId, SESSION_TTL_SECONDS);

  return NextResponse.redirect("/app");
}