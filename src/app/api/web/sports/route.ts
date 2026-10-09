import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { generateCuratedLiveMatches, parseSupabaseMatchRow } from "@/features/web/sports/sportsData";
import type { SportMatch } from "@/features/web/sports/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const curated = generateCuratedLiveMatches();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("megatv_sports_guide")
      .select("*")
      .or("status.eq.LIVE,status.eq.UPCOMING")
      .order("match_time", { ascending: true })
      .limit(60);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ matches: curated });
    }

    const dbMatches: SportMatch[] = data.map(parseSupabaseMatchRow);

    // Merge: live curated first, then live DB, then upcoming curated & DB
    const liveMatches = [
      ...curated.filter((m) => m.status === "LIVE"),
      ...dbMatches.filter((m) => m.status === "LIVE")
    ];

    const upcomingMatches = [
      ...curated.filter((m) => m.status === "UPCOMING"),
      ...dbMatches.filter((m) => m.status === "UPCOMING")
    ];

    // Deduplicate by ID
    const seen = new Set<string>();
    const merged: SportMatch[] = [];

    for (const m of [...liveMatches, ...upcomingMatches]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        merged.push(m);
      }
    }

    return NextResponse.json({ matches: merged });
  } catch {
    return NextResponse.json({ matches: curated });
  }
}
