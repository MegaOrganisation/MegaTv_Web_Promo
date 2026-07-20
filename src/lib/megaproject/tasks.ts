import { queryMegaProjectTasks } from "@/lib/megaproject/client";
import type { MegaProjectTasksPayload } from "@/lib/megaproject/types";

export type { MegaProjectTaskRow, MegaProjectTasksPayload } from "@/lib/megaproject/types";

const CACHE_MS = 5 * 60 * 1000;
let cache: { at: number; payload: MegaProjectTasksPayload } | null = null;

export async function fetchMegaProjectTasks(): Promise<MegaProjectTasksPayload> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return cache.payload;
  const payload = await queryMegaProjectTasks();
  cache = { at: now, payload };
  return payload;
}
