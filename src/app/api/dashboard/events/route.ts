import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type EventBody = {
  sessionId?: string | null;
  profileId?: string | null;
  page?: string;
  route?: string;
  referrer?: string | null;
  openedAt?: string;
  closedAt?: string | null;
  durationMs?: number | null;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as EventBody | null;
  if (!body?.page || !body.route) {
    return NextResponse.json({ error: "Missing page or route" }, { status: 400 });
  }

  const { error } = await supabase.from("megacompanion_page_events").insert({
    user_id: user.id,
    profile_id: sanitizeText(body.profileId),
    session_id: body.sessionId || null,
    page: sanitizeText(body.page) || "Companion",
    route: sanitizeRoute(body.route),
    referrer: sanitizeText(body.referrer),
    opened_at: body.openedAt || new Date().toISOString(),
    closed_at: body.closedAt || null,
    duration_ms: typeof body.durationMs === "number" ? Math.max(0, Math.round(body.durationMs)) : null,
    metadata: sanitizeMetadata(body.metadata)
  });

  if (error) return NextResponse.json({ error: "Event unavailable" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

function sanitizeText(value?: string | null) {
  if (!value) return null;
  return value.replace(/[\r\n\t]/g, " ").slice(0, 180);
}

function sanitizeRoute(value: string) {
  try {
    const url = new URL(value, "https://local.invalid");
    return url.pathname.slice(0, 180);
  } catch {
    return value.split("?")[0].slice(0, 180);
  }
}

function sanitizeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return {};
  const allowed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata).slice(0, 10)) {
    if (typeof value === "string") allowed[key.slice(0, 40)] = value.slice(0, 120);
    if (typeof value === "number" || typeof value === "boolean") allowed[key.slice(0, 40)] = value;
  }
  return allowed;
}
