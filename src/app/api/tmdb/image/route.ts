import { NextResponse } from "next/server";

import type { TmdbImageSize } from "@/lib/tmdb";

const IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";
const ALLOWED: TmdbImageSize[] = ["w185", "w300", "w342", "w500", "w780", "w1280"];

/**
 * Proxy image TMDB same-origin — public (path regex-validé).
 * Auth retirée : `CompanionCanvasImg` utilise crossOrigin=anonymous (pas de cookies).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = (searchParams.get("size") || "w342") as TmdbImageSize;
  const rawPath = searchParams.get("path");

  if (!rawPath || !ALLOWED.includes(size)) {
    return NextResponse.json({ error: "Invalid image params" }, { status: 400 });
  }

  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  if (!/^\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const upstream = `${IMAGE_BASE}/${size}${path}`;
  const response = await fetch(upstream, {
    next: { revalidate: 60 * 60 * 24 * 7 }
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
  }

  const bytes = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/jpeg";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
