import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { AVATAR_REGISTRY } from "@/lib/profiles/avatars";
import { formatPinInput, hashPin, isValidPin, verifyPin } from "@/lib/profiles/pin";
import { FORCE_SYNC_ALL_SCOPES, requestForceSync } from "@/lib/companion/force-sync";
import { SyncPayloadConflictError, updateProfileInSyncPayload } from "@/lib/companion/sync-payload";
import type { ProfileRow } from "@/lib/supabase/types";

type Body = {
  name?: unknown;
  avatarId?: unknown;
  removeCustomAvatar?: unknown;
  usePresetAvatar?: unknown;
  isKidsProfile?: unknown;
  pin?: unknown;
  removePin?: unknown;
  currentPin?: unknown;
};

export async function PATCH(request: Request, context: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await context.params;
  const cleanProfileId = sanitizeId(profileId);
  if (!cleanProfileId) return NextResponse.json({ error: "Profil invalide" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const { data: existing, error: existingError } = await supabase
    .from("v_megacompanion_user_profiles")
    .select("*")
    .eq("profile_id", cleanProfileId)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: "Profil indisponible" }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const { data: secureProfile, error: secureError } = await supabase
    .from("user_profiles")
    .select("pin,is_locked")
    .eq("user_id", user.id)
    .eq("id", cleanProfileId)
    .maybeSingle();

  if (secureError) return NextResponse.json({ error: "Profil indisponible" }, { status: 500 });

  const current = existing as ProfileRow;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const payloadPatch: Parameters<typeof updateProfileInSyncPayload>[3] = { lastUsedAt: Date.now() };

  if (body.name !== undefined) {
    const name = sanitizeName(body.name);
    if (!name) return NextResponse.json({ error: "Le nom du profil est obligatoire" }, { status: 400 });
    update.name = name;
    payloadPatch.name = name;
  }

  if (body.avatarId !== undefined) {
    const avatarId = sanitizeAvatarId(body.avatarId);
    if (avatarId === null) return NextResponse.json({ error: "Avatar invalide" }, { status: 400 });
    update.avatar_id = avatarId;
    payloadPatch.avatarId = avatarId;
    if (body.usePresetAvatar === true && avatarId > 0) {
      update.avatar_image_version = 0;
      update.avatar_image_storage_path = null;
      payloadPatch.avatarImageVersion = 0;
      payloadPatch.avatarImageStoragePath = null;
    }
  }

  if (body.removeCustomAvatar === true) {
    update.avatar_image_version = 0;
    update.avatar_image_storage_path = null;
    payloadPatch.avatarImageVersion = 0;
    payloadPatch.avatarImageStoragePath = null;
  }

  if (body.isKidsProfile !== undefined) {
    const isKidsProfile = Boolean(body.isKidsProfile);
    update.is_kids_profile = isKidsProfile;
    payloadPatch.isKidsProfile = isKidsProfile;
  }

  if (body.removePin === true) {
    const storedPin = secureProfile?.pin as string | null | undefined;
    if (storedPin && !verifyPin(String(body.currentPin || ""), storedPin)) {
      return NextResponse.json({ error: "PIN actuel incorrect" }, { status: 403 });
    }
    update.pin = null;
    update.is_locked = false;
    payloadPatch.isLocked = false;
  } else if (body.pin !== undefined) {
    const nextPin = formatPinInput(String(body.pin || ""));
    if (!isValidPin(nextPin)) {
      return NextResponse.json({ error: "Le PIN doit contenir 4 ou 5 chiffres" }, { status: 400 });
    }
    const storedPin = secureProfile?.pin as string | null | undefined;
    if (storedPin && !verifyPin(String(body.currentPin || ""), storedPin)) {
      return NextResponse.json({ error: "PIN actuel incorrect" }, { status: 403 });
    }
    update.pin = hashPin(nextPin);
    update.is_locked = true;
    payloadPatch.isLocked = true;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .update(update)
    .eq("user_id", user.id)
    .eq("id", cleanProfileId)
    .select("id,name,avatar_id,avatar_image_version,avatar_image_storage_path,is_kids_profile,is_locked,last_used_at,updated_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Mise à jour du profil impossible" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  try {
    await updateProfileInSyncPayload(supabase, user.id, cleanProfileId, payloadPatch, current);
  } catch (error) {
    if (error instanceof SyncPayloadConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Profil mis à jour, mais synchronisation payload incomplète" }, { status: 202 });
  }

  await requestForceSync([...FORCE_SYNC_ALL_SCOPES]);
  return NextResponse.json({ ok: true, profile: data, forceSync: true });
}

function sanitizeId(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120) return null;
  return trimmed;
}

function sanitizeName(value: unknown) {
  if (typeof value !== "string") return null;
  return value.replace(/[\r\n\t]/g, " ").trim().slice(0, 60) || null;
}

function sanitizeAvatarId(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.trunc(value);
  if (normalized < 0 || !AVATAR_REGISTRY.allIds.includes(normalized)) return null;
  return normalized;
}
