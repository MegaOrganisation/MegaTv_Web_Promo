import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { isSafeRemoteUrl, proxyUrl } from "@/lib/web/stream-proxy";

export const dynamic = "force-dynamic";

/**
 * Mints a signed same-origin proxy URL for a single stream (used by the live TV
 * player as a CORS fallback). Auth-gated + SSRF-validated so it is not an open
 * proxy; called at most once per channel the user actually plays.
 */
export async function GET(request: Request) {
  await requireUser("/web/tv");

  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url")?.trim() || "";
  if (!target || !isSafeRemoteUrl(target)) {
    return NextResponse.json({ ok: false, error: "url invalide" }, { status: 400 });
  }

  const kind = /\.m3u8(\?|$)/i.test(target) ? "m3u8" : "seg";
  return NextResponse.json({ ok: true, url: proxyUrl(target, kind) });
}
