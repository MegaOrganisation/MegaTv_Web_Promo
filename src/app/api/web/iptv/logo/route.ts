import { NextResponse } from "next/server";

import { isSafeRemoteUrl, safeFetch } from "@/lib/web/stream-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UA = "VLC/3.0.20 LibVLC/3.0.20";
const FETCH_TIMEOUT_MS = 12_000;

/**
 * Proxy logos IPTV same-origin — les panels bloquent souvent le hotlink navigateur.
 * SSRF : `isSafeRemoteUrl` + `safeFetch` (IP privée + redirects).
 */
export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url")?.trim() || "";
  if (!target || !isSafeRemoteUrl(target)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await safeFetch(target, {
      signal: controller.signal,
      headers: {
        "user-agent": UA,
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
      },
      cache: "force-cache",
      next: { revalidate: 86_400 }
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/png";
    const isImage =
      contentType.startsWith("image/") ||
      contentType.includes("octet-stream") ||
      contentType.includes("binary");
    if (!isImage) {
      return NextResponse.json({ error: "Not an image" }, { status: 415 });
    }

    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType.startsWith("image/") ? contentType : "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
