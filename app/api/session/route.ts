import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth/session";

export const runtime = "edge";

/**
 * Basic session inspection endpoint for debug/dev usage.
 * Returns:
 * { authenticated: boolean, userId?: string, workspaceId?: string }
 */
export async function GET(): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        authenticated: false
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      userId: session.userId,
      workspaceId: session.workspaceId
    },
    { status: 200 }
  );
}