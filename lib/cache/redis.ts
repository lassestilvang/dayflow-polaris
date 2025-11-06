"use server";

import { Redis } from "@upstash/redis";
import { env } from "../env";

if (typeof window !== "undefined") {
  throw new Error("Redis client must not be imported in the browser bundle");
}

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN
});

export async function getJson<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (value == null) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  // Upstash SDK can return decoded JSON already
  return value as T;
}

export async function setJson(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  const payload = JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    await redis.set(key, payload, { ex: ttlSeconds });
  } else {
    await redis.set(key, payload);
  }
}

export async function del(key: string): Promise<void> {
  await redis.del(key);
}