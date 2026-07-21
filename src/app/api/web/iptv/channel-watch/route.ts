import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type WatchRow = {
  channel_id?: string;
  channel_name?: string | null;
  logo_url?: string | null;
  watch_seconds?: number;
  last_watched_at?: string | null;
  absolute?: boolean;
};

/**
 * Batch IPTV channel watch → RPC `megacompanion_upsert_channel_watch_batch`
 * (même contrat que l’app Android / Free Tier friendly).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { profile?: string; rows?: WatchRow[] };
  try {
    body = (await request.json()) as { profile?: string; rows?: WatchRow[] };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const profileId = String(body.profile || "").trim();
  if (!profileId) {
    return NextResponse.json({ ok: false, error: "profile_required" }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  const payload = rows
    .map((r) => {
      const channelId = String(r.channel_id || "").trim();
      const watchSeconds = Math.max(0, Math.floor(Number(r.watch_seconds) || 0));
      if (!channelId || watchSeconds <= 0) return null;
      return {
        channel_id: channelId,
        channel_name: r.channel_name ? String(r.channel_name).trim() : null,
        logo_url: r.logo_url ? String(r.logo_url).trim() : null,
        watch_seconds: watchSeconds,
        last_watched_at: r.last_watched_at || new Date().toISOString(),
        absolute: Boolean(r.absolute)
      };
    })
    .filter(Boolean);

  if (payload.length === 0) {
    return NextResponse.json({ ok: true, upserted: 0 });
  }

  const { data, error } = await supabase.rpc("megacompanion_upsert_channel_watch_batch", {
    p_profile_id: profileId,
    p_rows: payload
  });

  if (error) {
    console.error("[iptv/channel-watch]", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, upserted: Number(data) || payload.length });
}
