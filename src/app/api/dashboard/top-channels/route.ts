import { NextResponse } from "next/server";

import { getTopChannelsForProfile } from "@/lib/dashboard/channel-watch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profile = searchParams.get("profile");

  try {
    const channels = await getTopChannelsForProfile(profile, 8);
    return NextResponse.json(
      { channels },
      { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=180" } }
    );
  } catch (error) {
    console.error("[dashboard/top-channels]", error);
    return NextResponse.json({ channels: [], error: "channels_unavailable" }, { status: 500 });
  }
}
