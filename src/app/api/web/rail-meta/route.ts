import { NextResponse } from "next/server";

import { fetchTmdbSummary } from "@/lib/tmdb";
import { decodeMediaId } from "@/lib/web/media";
import type { RailItemMeta } from "@/lib/web/rail-meta";

export type { RailItemMeta };

const MAX_IDS = 48;
const CHUNK = 6;

/** Batch TMDB summary for rail « Voir tout » filters — one call per modal open, chunked. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  const raw = Array.isArray(body?.ids) ? body.ids : [];
  const ids = [...new Set(raw.filter((id): id is string => typeof id === "string" && id.trim().length > 0))].slice(0, MAX_IDS);

  const meta: Record<string, RailItemMeta> = {};

  for (let offset = 0; offset < ids.length; offset += CHUNK) {
    const chunk = ids.slice(offset, offset + CHUNK);
    await Promise.all(
      chunk.map(async (mediaId) => {
        const ref = decodeMediaId(mediaId);
        if (!ref) return;
        const details = await fetchTmdbSummary(ref.mediaType, ref.tmdbId);
        if (!details) return;
        meta[mediaId] = {
          voteAverage: typeof details.vote_average === "number" ? details.vote_average : null,
          genres: (details.genres || []).map((genre) => genre.name).filter(Boolean),
          releaseDate: details.release_date || details.first_air_date || null
        };
      })
    );
  }

  return NextResponse.json(
    { meta },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
      }
    }
  );
}
