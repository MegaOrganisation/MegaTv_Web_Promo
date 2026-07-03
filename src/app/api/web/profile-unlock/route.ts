import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { formatPinInput, verifyPin } from "@/lib/profiles/pin";

/** Verifies a locked profile's PIN for the web client gate. Single-row read. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { profileId?: string; pin?: string } | null;
  const profileId = body?.profileId?.trim();
  const pin = formatPinInput(String(body?.pin || ""));
  if (!profileId) return NextResponse.json({ error: "Profil invalide" }, { status: 400 });

  const { data, error } = await supabase
    .from("user_profiles")
    .select("pin,is_locked")
    .eq("user_id", user.id)
    .eq("id", profileId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Profil indisponible" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const storedPin = data.pin as string | null | undefined;
  if (!data.is_locked || !storedPin) return NextResponse.json({ ok: true });

  if (!verifyPin(pin, storedPin)) {
    return NextResponse.json({ error: "PIN incorrect" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
