import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

// Explicitly load .env.local for drizzle-kit CLI, because it doesn't by default.
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("[drizzle.config] DATABASE_URL is not set. Using fallback postgres://localhost URL.");
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@localhost:5432/dayflow_polaris"
  },
  strict: true,
  verbose: true
} satisfies Config;