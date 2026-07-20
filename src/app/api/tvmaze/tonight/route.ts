import { NextResponse } from "next/server";

import { fetchTonightPrograms, isTonightCountry, type TonightCountry } from "@/lib/tvmaze/tonight";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryRaw = (searchParams.get("country") || "FR").toUpperCase();
  const country: TonightCountry = isTonightCountry(countryRaw) ? countryRaw : "FR";
  const date = searchParams.get("date") || undefined;

  try {
    const programs = await fetchTonightPrograms(country, date);
    return NextResponse.json(
      { country, date: date || new Date().toISOString().slice(0, 10), programs },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } }
    );
  } catch (error) {
    console.error("[tvmaze/tonight]", error);
    return NextResponse.json({ country, programs: [], error: "schedule_unavailable" }, { status: 502 });
  }
}
