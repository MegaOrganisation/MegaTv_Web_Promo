import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { SyncPayloadConflictError, updateProfileInSyncPayload } from "@/lib/companion/sync-payload";
import type { ProfileRow } from "@/lib/supabase/types";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg"]);

export async function POST(request: Request, context: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await context.params;
  const cleanProfileId = sanitizeId(profileId);
  if (!cleanProfileId) return NextResponse.json({ error: "Profil invalide" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing, error: existingError } = await supabase
    .from("v_megacompanion_user_profiles")
    .select("*")
    .eq("profile_id", cleanProfileId)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: "Profil indisponible" }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("avatar");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Format image non supporté" }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Image trop volumineuse" }, { status: 400 });

  const version = Date.now();
  const path = `${user.id}/${cleanProfileId}/${version}.jpg`;
  const normalizedFile = await normalizeAvatarFile(file);

  const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(path, normalizedFile, {
    cacheControl: "31536000",
    contentType: "image/jpeg",
    upsert: true
  });

  if (uploadError) return NextResponse.json({ error: "Upload de la photo impossible" }, { status: 500 });

  const { data, error } = await supabase
    .from("user_profiles")
    .update({ avatar_image_version: version, avatar_image_storage_path: path, avatar_id: 0, updated_at: new Date(version).toISOString() })
    .eq("user_id", user.id)
    .eq("id", cleanProfileId)
    .select("id,name,avatar_color,avatar_id,avatar_image_version,avatar_image_storage_path,is_kids_profile,is_locked,last_used_at,updated_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Mise à jour du profil impossible" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  try {
    await updateProfileInSyncPayload(
      supabase,
      user.id,
      cleanProfileId,
      { avatarId: 0, avatarImageVersion: version, avatarImageStoragePath: path, lastUsedAt: version },
      existing as ProfileRow
    );
  } catch (error) {
    if (error instanceof SyncPayloadConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Profil mis à jour, mais synchronisation payload incomplète" }, { status: 202 });
  }

  return NextResponse.json({ ok: true, profile: data });
}

async function normalizeAvatarFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return new File([arrayBuffer], "avatar.jpg", { type: "image/jpeg" });
}

function sanitizeId(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120) return null;
  return trimmed;
}
