import { NextResponse } from "next/server";

import { fetchTonightPrograms, isTonightCountry, type TonightCountry } from "@/lib/tvmaze/tonight";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryRaw = (searchParams.get("country") || "FR").toUpperCase();
  const country: TonightCountry = isTonightCountry(countryRaw) ? countryRaw : "FR";
  const date = searchParams.get("date") || undefined;
  const channel = searchParams.get("channel") || undefined;

  try {
    const result = await fetchTonightPrograms(country, date, channel);
    return NextResponse.json(
      {
        country,
        date: date || new Date().toISOString().slice(0, 10),
        channel: channel || null,
        source: result.source,
        channels: result.channels,
        programs: result.programs
      },
      { headers: { "Cache-Control": "private, max-age=120, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("[tvmaze/tonight]", error);
    return NextResponse.json(
      { country, programs: [], channels: [], error: "schedule_unavailable" },
      { status: 502 }
    );
  }
}
