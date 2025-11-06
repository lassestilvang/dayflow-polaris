import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { integrations, integrationProviderEnum } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/guards";

export async function GET(): Promise<NextResponse> {
  const session = await requireSession();
  const workspaceId = session.workspaceId;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "Workspace context required" },
      { status: 400 }
    );
  }

  const rows = await db
    .select({
      id: integrations.id,
      provider: integrations.provider,
      enabled: integrations.enabled,
      createdAt: integrations.createdAt,
      updatedAt: integrations.updatedAt
    })
    .from(integrations)
    .where(integrations.workspaceId.eq(workspaceId));

  const data = rows.map((row) => {
    const provider =
      integrationProviderEnum.enumValues.find((p) => p === row.provider) ??
      row.provider;

    const status: "connected" | "error" | "disconnected" =
      row.enabled ? "connected" : "disconnected";

    return {
      id: row.id,
      provider,
      status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  });

  return NextResponse.json(data);
}