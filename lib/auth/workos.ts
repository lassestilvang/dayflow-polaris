"use server";

import { WorkOS } from "@workos-inc/node";
import { env } from "../env";

let workosClient: WorkOS | null = null;

function createWorkOS(): WorkOS {
  if (!env.WORKOS_API_KEY) {
    throw new Error("WORKOS_API_KEY is not configured");
  }

  return new WorkOS(env.WORKOS_API_KEY);
}

export function getWorkOS(): WorkOS {
  if (typeof window !== "undefined") {
    throw new Error("WorkOS client must not be used in the browser");
  }

  if (!workosClient) {
    workosClient = createWorkOS();
  }

  return workosClient;
}

export const workos = getWorkOS();