import { z } from "zod";

const baseSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().min(1),
  DATABASE_URL: z.string().url().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  WORKOS_API_KEY: z.string().min(1),
  WORKOS_CLIENT_ID: z.string().min(1),
  WORKOS_REDIRECT_URI: z.string().url().min(1),
  WORKOS_WEBHOOK_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"])
});

type EnvSchema = z.infer<typeof baseSchema>;

function loadEnv(): EnvSchema {
  const parsed = baseSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    WORKOS_API_KEY: process.env.WORKOS_API_KEY,
    WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
    WORKOS_REDIRECT_URI: process.env.WORKOS_REDIRECT_URI,
    WORKOS_WEBHOOK_SECRET: process.env.WORKOS_WEBHOOK_SECRET ?? "unused-for-now",
    NODE_ENV: process.env.NODE_ENV ?? "development"
  });

  if (!parsed.success) {
    // In test, allow missing values to avoid breaking tooling.
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === "test") {
      const fallback = baseSchema.partial().parse({
        NEXT_PUBLIC_APP_URL:
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        DATABASE_URL: process.env.DATABASE_URL ?? "http://localhost:5432/placeholder",
        UPSTASH_REDIS_REST_URL:
          process.env.UPSTASH_REDIS_REST_URL ?? "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN:
          process.env.UPSTASH_REDIS_REST_TOKEN ?? "test-token",
        WORKOS_API_KEY: process.env.WORKOS_API_KEY ?? "test-api-key",
        WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID ?? "client-id",
        WORKOS_REDIRECT_URI:
          process.env.WORKOS_REDIRECT_URI ??
          "http://localhost:3000/api/auth/workos/callback",
        WORKOS_WEBHOOK_SECRET:
          process.env.WORKOS_WEBHOOK_SECRET ?? "unused-for-now",
        NODE_ENV: "test"
      });

      return {
        NEXT_PUBLIC_APP_URL:
          fallback.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        DATABASE_URL:
          fallback.DATABASE_URL ?? "http://localhost:5432/placeholder",
        UPSTASH_REDIS_REST_URL:
          fallback.UPSTASH_REDIS_REST_URL ?? "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN:
          fallback.UPSTASH_REDIS_REST_TOKEN ?? "test-token",
        WORKOS_API_KEY: fallback.WORKOS_API_KEY ?? "test-api-key",
        WORKOS_CLIENT_ID: fallback.WORKOS_CLIENT_ID ?? "client-id",
        WORKOS_REDIRECT_URI:
          fallback.WORKOS_REDIRECT_URI ??
          "http://localhost:3000/api/auth/workos/callback",
        WORKOS_WEBHOOK_SECRET:
          fallback.WORKOS_WEBHOOK_SECRET ?? "unused-for-now",
        NODE_ENV: "test"
      };
    }

    // Non-test: fail fast with clear error
    const formatted = parsed.error.format();
    throw new Error(
      `Invalid environment configuration. Missing or invalid variables: ${JSON.stringify(
        formatted,
        null,
        2
      )}`
    );
  }

  return parsed.data;
}

export const env = loadEnv();