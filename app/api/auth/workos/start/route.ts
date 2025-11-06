import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { env } from "../../../../../lib/env";

const STATE_COOKIE_NAME = "dayflow_workos_state";
const STATE_TTL_SECONDS = 10 * 60; // 10 minutes

export const runtime = "edge";

/**
 * Minimal WorkOS SSO start: generate state, persist in cookie, redirect to WorkOS.
 * For now we manually construct the URL to avoid pulling extra helpers.
 */
export async function GET(): Promise<Response> {
  const state = randomUUID();

  const cookieStore = await cookies();
  const expires = new Date(Date.now() + STATE_TTL_SECONDS * 1000);

  cookieStore.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires
  });

  const url = new URL("https://api.workos.com/sso/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.WORKOS_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.WORKOS_REDIRECT_URI);
  url.searchParams.set("state", state);
  // Future: add organization / domain_hint / provider options via query params.

  return NextResponse.redirect(url.toString(), {
    status: 307
  });
}