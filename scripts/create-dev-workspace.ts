import { db } from "../lib/db/client";
import { workspaces } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const slug = "dev-workspace";

  const existing = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  let ws = existing[0];

  if (!ws) {
    const inserted = await db
      .insert(workspaces)
      .values({ name: "Dev Workspace", slug })
      .returning();
    ws = inserted[0]!;
  }

  if (!ws) {
    throw new Error("Failed to create or fetch dev workspace");
  }

  console.log(`DEV_WORKSPACE_ID=${ws.id}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });