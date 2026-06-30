import { NextResponse } from "next/server";

import { PROFILE_COLORS, TOTAL_AVATARS } from "@/lib/profiles/avatars";
import { createClient } from "@/lib/supabase/server";
import { SyncPayloadConflictError, updateProfileInSyncPayload } from "@/lib/companion/sync-payload";
import type { ProfileRow } from "@/lib/supabase/types";

type Body = {
  name?: unknown;
  avatarColor?: unknown;
  avatarId?: unknown;
  removeCustomAvatar?: unknown;
  usePresetAvatar?: unknown;
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

  const current = existing as ProfileRow;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const payloadPatch: Parameters<typeof updateProfileInSyncPayload>[3] = { lastUsedAt: Date.now() };

  if (body.name !== undefined) {
    const name = sanitizeName(body.name);
    if (!name) return NextResponse.json({ error: "Le nom du profil est obligatoire" }, { status: 400 });
    update.name = name;
    payloadPatch.name = name;
  }

  if (body.avatarColor !== undefined) {
    const avatarColor = sanitizeColor(body.avatarColor);
    if (avatarColor === null) return NextResponse.json({ error: "Couleur invalide" }, { status: 400 });
    update.avatar_color = avatarColor;
    payloadPatch.avatarColor = avatarColor;
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

  const { data, error } = await supabase
    .from("user_profiles")
    .update(update)
    .eq("user_id", user.id)
    .eq("id", cleanProfileId)
    .select("id,name,avatar_color,avatar_id,avatar_image_version,avatar_image_storage_path,is_kids_profile,is_locked,last_used_at,updated_at")
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

  return NextResponse.json({ ok: true, profile: data });
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

function sanitizeColor(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.trunc(value) >>> 0;
  return PROFILE_COLORS.some((color) => color === normalized) ? normalized : null;
}

function sanitizeAvatarId(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.trunc(value);
  if (normalized < 0 || normalized > TOTAL_AVATARS) return null;
  return normalized;
}
