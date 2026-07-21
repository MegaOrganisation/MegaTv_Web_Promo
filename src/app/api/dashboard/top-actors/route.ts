import { NextResponse } from "next/server";

import { buildTopActorsByWatchTime } from "@/lib/dashboard/buildTopActorsByWatchTime";
import { getWatchHistory } from "@/lib/dashboard/watch-data";
import { getDashboardData } from "@/lib/dashboard/queries";
import type { TopContentRow } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profile = searchParams.get("profile");

  try {
    const [historyResult, dash] = await Promise.all([
      getWatchHistory(profile, 120),
      getDashboardData(profile)
    ]);

    // Seed optionnel depuis le client (top contenus déjà affichés)
    let seed: TopContentRow[] = dash.topContent || [];
    const seedParam = searchParams.get("seed");
    if (seedParam) {
      try {
        const parsed = JSON.parse(seedParam) as TopContentRow[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          seed = parsed;
        }
      } catch {
        /* ignore */
      }
    }

    const actors = await buildTopActorsByWatchTime(historyResult.rows || [], seed, 8);
    return NextResponse.json(
      { actors },
      { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=180" } }
    );
  } catch (error) {
    console.error("[dashboard/top-actors]", error);
    return NextResponse.json({ actors: [], error: "actors_unavailable" }, { status: 500 });
  }
}

/** POST avec body { seed: TopContentRow[] } — évite URL trop longue. */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const profile = searchParams.get("profile");

  try {
    let seed: TopContentRow[] = [];
    try {
      const body = (await request.json()) as { seed?: TopContentRow[] };
      if (Array.isArray(body?.seed)) seed = body.seed;
    } catch {
      /* empty */
    }

    const [historyResult, dash] = await Promise.all([
      getWatchHistory(profile, 120),
      getDashboardData(profile)
    ]);

    const mergedSeed = seed.length > 0 ? seed : dash.topContent || [];
    const actors = await buildTopActorsByWatchTime(historyResult.rows || [], mergedSeed, 8);
    return NextResponse.json({ actors });
  } catch (error) {
    console.error("[dashboard/top-actors POST]", error);
    return NextResponse.json({ actors: [], error: "actors_unavailable" }, { status: 500 });
  }
}
