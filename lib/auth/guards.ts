"use server";

import { getSession } from "./session";

export class AuthError extends Error {
  readonly code: "UNAUTHENTICATED" | "NO_WORKSPACE";

  constructor(code: "UNAUTHENTICATED" | "NO_WORKSPACE", message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "AuthError";
  }
}

/**
 * Ensure there is a valid authenticated session.
 * Throws AuthError("UNAUTHENTICATED") if missing.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new AuthError("UNAUTHENTICATED", "Authentication required");
  }
  return session;
}

/**
 * Ensure session is present and bound to a workspace.
 * Throws AuthError("UNAUTHENTICATED") if no session,
 * or AuthError("NO_WORKSPACE") if workspace is missing.
 */
export async function requireWorkspace() {
  const session = await getSession();
  if (!session) {
    throw new AuthError("UNAUTHENTICATED", "Authentication required");
  }
  if (!session.workspaceId) {
    throw new AuthError("NO_WORKSPACE", "Workspace context is required");
  }
  return session;
}