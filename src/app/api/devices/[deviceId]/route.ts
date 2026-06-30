import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { updateDeviceInSyncPayload } from "@/lib/companion/sync-payload";
import type { DeviceRow } from "@/lib/supabase/types";

type Body = {
  displayName?: unknown;
};

export async function PATCH(request: Request, context: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await context.params;
  const cleanDeviceId = sanitizeId(deviceId);
  if (!cleanDeviceId) return NextResponse.json({ error: "Appareil invalide" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const displayName = sanitizeDisplayName(body.displayName);
  if (displayName === null) return NextResponse.json({ error: "Nom d'appareil invalide" }, { status: 400 });

  const { data: existing, error: existingError } = await supabase
    .from("v_megacompanion_devices")
    .select("*")
    .eq("device_id", cleanDeviceId)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: "Appareil indisponible" }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Appareil introuvable" }, { status: 404 });

  const { data, error } = await supabase
    .from("account_devices")
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("id", cleanDeviceId)
    .select("id,display_name,default_label,device_type,manufacturer,model,app_version,first_seen_at,last_seen_at,updated_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Mise à jour de l'appareil impossible" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Appareil introuvable" }, { status: 404 });

  try {
    await updateDeviceInSyncPayload(supabase, user.id, cleanDeviceId, { displayName }, existing as DeviceRow);
  } catch {
    return NextResponse.json({ error: "Appareil mis à jour, mais synchronisation payload incomplète" }, { status: 202 });
  }

  return NextResponse.json({ ok: true, device: data });
}

function sanitizeId(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 160) return null;
  return trimmed;
}

function sanitizeDisplayName(value: unknown) {
  if (typeof value !== "string") return null;
  return value.replace(/[\r\n\t]/g, " ").trim().slice(0, 60);
}
