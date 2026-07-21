import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { FORCE_SYNC_ALL_SCOPES, requestForceSync } from "@/lib/companion/force-sync";

export async function POST(request: Request) {
  await requireUser("/companion/manage");
  const body = (await request.json().catch(() => ({}))) as { scopes?: string[] };
  const scopes =
    Array.isArray(body.scopes) && body.scopes.length > 0 ? body.scopes : [...FORCE_SYNC_ALL_SCOPES];

  const { error } = await requestForceSync(scopes);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, pending: { scopes } });
}
