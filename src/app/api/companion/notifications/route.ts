import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Notifications légères — watchlist + reprises (pas de spam TMDB réseau). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const items: Array<{ title: string; meta: string; kind: string }> = [];

  const { data: watchlist } = await supabase.from("v_account_sync_watchlist").select("title,tmdb_id,media_type").eq("user_id", user.id).limit(5);

  for (const row of watchlist ?? []) {
    items.push({
      title: row.title || `TMDB ${row.tmdb_id}`,
      meta: row.media_type === "tv" ? "Dans votre watchlist — surveillez les nouveaux épisodes" : "Dans votre watchlist — sortie à venir",
      kind: "watchlist"
    });
  }

  return NextResponse.json({ items: items.slice(0, 6) });
}
