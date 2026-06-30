import { createClient } from "@/lib/supabase/server";
import type { DeviceRow, ProfileRow } from "@/lib/supabase/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type JsonObject = Record<string, unknown>;

type ProfilePayloadPatch = {
  name?: string;
  avatarColor?: number;
  avatarId?: number;
  avatarImageVersion?: number;
  avatarImageStoragePath?: string | null;
  lastUsedAt?: number;
};

type DevicePayloadPatch = {
  displayName?: string;
};

export class SyncPayloadConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SyncPayloadConflictError";
  }
}

export async function updateProfileInSyncPayload(
  supabase: SupabaseClient,
  userId: string,
  profileId: string,
  patch: ProfilePayloadPatch,
  fallbackProfile?: ProfileRow | null
) {
  await mutatePayload(supabase, userId, (payload, now) => {
    const deletedIds = Array.isArray(payload.deletedProfileIds) ? payload.deletedProfileIds.map(String) : [];
    if (deletedIds.includes(profileId)) {
      throw new SyncPayloadConflictError("Ce profil est marqué comme supprimé côté cloud.");
    }

    const profiles = Array.isArray(payload.profiles) ? [...payload.profiles] : [];
    const index = profiles.findIndex((item) => isObject(item) && String(item.id || "") === profileId);
    const lastUsedAt = patch.lastUsedAt || now;
    const base = index >= 0 && isObject(profiles[index]) ? { ...profiles[index] } : profileToPayload(fallbackProfile, profileId, lastUsedAt);

    profiles[index >= 0 ? index : profiles.length] = {
      ...base,
      id: profileId,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.avatarColor !== undefined ? { avatarColor: patch.avatarColor } : {}),
      ...(patch.avatarId !== undefined ? { avatarId: patch.avatarId } : {}),
      ...(patch.avatarImageVersion !== undefined ? { avatarImageVersion: patch.avatarImageVersion } : {}),
      ...(patch.avatarImageStoragePath !== undefined ? { avatarImageStoragePath: patch.avatarImageStoragePath } : {}),
      lastUsedAt
    };

    payload.profiles = profiles;
  });
}

export async function updateDeviceInSyncPayload(
  supabase: SupabaseClient,
  userId: string,
  deviceId: string,
  patch: DevicePayloadPatch,
  fallbackDevice?: DeviceRow | null
) {
  await mutatePayload(supabase, userId, (payload) => {
    const devices = isObject(payload.registeredDevicesById) ? { ...payload.registeredDevicesById } : {};
    const existing = isObject(devices[deviceId]) ? { ...devices[deviceId] } : deviceToPayload(fallbackDevice, deviceId);

    devices[deviceId] = {
      ...existing,
      id: deviceId,
      ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {})
    };

    payload.registeredDevicesById = devices;
  });
}

async function mutatePayload(supabase: SupabaseClient, userId: string, mutator: (payload: JsonObject, now: number) => void) {
  const { data, error } = await supabase.from("account_sync_state").select("payload").eq("user_id", userId).maybeSingle();
  if (error) throw error;

  const payload = parsePayload(data?.payload);
  const now = Date.now();
  mutator(payload, now);
  payload.userId = userId;
  payload.updatedAt = Math.max(toFiniteNumber(payload.updatedAt) + 1, now);

  const { error: upsertError } = await supabase.from("account_sync_state").upsert(
    {
      user_id: userId,
      payload: JSON.stringify(payload),
      updated_at: new Date(now).toISOString()
    },
    { onConflict: "user_id" }
  );

  if (upsertError) throw upsertError;
}

function parsePayload(value: unknown): JsonObject {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return { ...(value as JsonObject) };
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function profileToPayload(profile: ProfileRow | null | undefined, profileId: string, now: number): JsonObject {
  return {
    id: profileId,
    name: profile?.name || "Profil",
    avatarColor: profile?.avatar_color || 0xffffffff,
    avatarId: profile?.avatar_id || 0,
    avatarImageVersion: profile?.avatar_image_version || 0,
    avatarImageStoragePath: profile?.avatar_image_storage_path || null,
    isKidsProfile: Boolean(profile?.is_kids_profile),
    isLocked: Boolean(profile?.is_locked),
    lastUsedAt: profile?.last_used_at || now
  };
}

function deviceToPayload(device: DeviceRow | null | undefined, deviceId: string): JsonObject {
  return {
    id: deviceId,
    displayName: device?.display_name || "",
    defaultLabel: device?.default_label || "",
    deviceType: device?.device_type || "unknown",
    manufacturer: device?.manufacturer || "",
    model: device?.model || "",
    appVersion: device?.app_version || "",
    firstSeenAt: 0,
    lastSeenAt: 0,
    lastAppActiveAt: 0
  };
}

function toFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
