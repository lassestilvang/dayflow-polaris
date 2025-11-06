"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "../env";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __dayflowDb__: ReturnType<typeof drizzle> | undefined;
}

function createClient() {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export const db =
  typeof window === "undefined"
    ? globalThis.__dayflowDb__ ?? (globalThis.__dayflowDb__ = createClient())
    : (() => {
        throw new Error("db client must not be used in the browser");
      })();