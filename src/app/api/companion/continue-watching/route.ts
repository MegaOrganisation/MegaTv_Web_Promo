import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { getDashboardData } from "@/lib/dashboard/queries";

export async function GET(request: Request) {
  await requireUser("/companion");
  const { searchParams } = new URL(request.url);
  const profile = searchParams.get("profile");
  const { continueWatching } = await getDashboardData(profile);

  return NextResponse.json(
    { items: continueWatching.slice(0, 6) },
    { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } }
  );
}
