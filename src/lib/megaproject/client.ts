import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { MegaProjectTasksPayload, MegaProjectTaskRow } from "@/lib/megaproject/types";

export function megaprojectEmbedUrl() {
  const env = process.env.NEXT_PUBLIC_MEGAPROJECT_EMBED_URL?.trim();
  if (env) return env.endsWith("/") ? env : `${env}/`;
  // Kanban statique embarqué dans public/megaproject (dev + fallback prod)
  return "/megaproject/";
}

function megaprojectSupabase(): SupabaseClient | null {
  const url = process.env.MEGAPROJECT_SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.MEGAPROJECT_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.MEGAPROJECT_SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function queryMegaProjectTasks(): Promise<MegaProjectTasksPayload> {
  const embed = megaprojectEmbedUrl();
  const client = megaprojectSupabase();

  if (!client) {
    return {
      configured: false,
      embedUrl: embed,
      tasks: [],
      openCount: 0,
      error: "Supabase MegaProject non configuré (MEGAPROJECT_SUPABASE_URL ou clés manquantes)"
    };
  }

  const { data, error } = await client
    .from("tasks")
    .select("id,title,status,priority,project_id,updated_at")
    .neq("status", "done")
    .order("updated_at", { ascending: false })
    .limit(12);

  if (error) {
    return {
      configured: false,
      embedUrl: embed,
      tasks: [],
      openCount: 0,
      error: error.message.includes("does not exist") ? "Table `tasks` absente — utilisez le Supabase MegaProject dédié." : error.message
    };
  }

  const tasks = (data ?? []) as MegaProjectTaskRow[];
  return { configured: true, embedUrl: embed, tasks, openCount: tasks.length };
}
