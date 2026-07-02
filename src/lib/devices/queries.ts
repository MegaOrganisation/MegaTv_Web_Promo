import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/supabase/types";

export type MergedDevice = DeviceRow & {
  last_app_active_at: string | null;
  is_online: boolean;
  duplicate_count?: number;
};

const ONLINE_MS = 5 * 60 * 1000;

function parsePayload(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function toIsoFromMs(value: unknown) {
  const ms = typeof value === "number" && Number.isFinite(value) ? value : 0;
  if (ms <= 0) return null;
  return new Date(ms).toISOString();
}

function deviceStableKey(device: {
  manufacturer?: string | null;
  model?: string | null;
  default_label?: string | null;
  display_name?: string | null;
}) {
  const manufacturer = (device.manufacturer || "").trim().toLowerCase();
  const model = (device.model || "").trim().toLowerCase();
  const label = (device.default_label || device.display_name || "").trim().toLowerCase();
  return `${manufacturer}|${model}|${label}`;
}

function mergeDeviceRows(tableRows: DeviceRow[], payloadDevices: Record<string, unknown>) {
  const merged = new Map<string, MergedDevice & { _lastAppActiveMs: number; _lastSeenMs: number }>();

  for (const [deviceId, raw] of Object.entries(payloadDevices)) {
    if (!raw || typeof raw !== "object") continue;
    const entry = raw as Record<string, unknown>;
    const lastAppActiveMs = Number(entry.lastAppActiveAt || 0);
    const lastSeenMs = Math.max(Number(entry.lastSeenAt || 0), lastAppActiveMs);
    merged.set(deviceId, {
      user_id: "",
      device_id: deviceId,
      display_name: String(entry.displayName || ""),
      default_label: String(entry.defaultLabel || ""),
      device_type: String(entry.deviceType || "unknown"),
      manufacturer: String(entry.manufacturer || ""),
      model: String(entry.model || ""),
      app_version: String(entry.appVersion || ""),
      first_seen_at: toIsoFromMs(entry.firstSeenAt),
      last_seen_at: toIsoFromMs(lastSeenMs),
      updated_at: toIsoFromMs(lastSeenMs),
      last_app_active_at: toIsoFromMs(lastAppActiveMs),
      is_online: false,
      _lastAppActiveMs: lastAppActiveMs,
      _lastSeenMs: lastSeenMs
    });
  }

  tableRows.forEach((row) => {
    const existing = merged.get(row.device_id);
    const lastSeenMs = row.last_seen_at ? Date.parse(row.last_seen_at) : 0;
    const lastAppActiveMs = existing?._lastAppActiveMs || 0;
    const activityMs = Math.max(lastSeenMs, lastAppActiveMs);
    merged.set(row.device_id, {
      user_id: row.user_id,
      device_id: row.device_id,
      display_name: row.display_name || existing?.display_name || "",
      default_label: row.default_label || existing?.default_label || "",
      device_type: row.device_type || existing?.device_type || "unknown",
      manufacturer: row.manufacturer || existing?.manufacturer || "",
      model: row.model || existing?.model || "",
      app_version: row.app_version || existing?.app_version || "",
      first_seen_at: row.first_seen_at || existing?.first_seen_at || null,
      last_seen_at: row.last_seen_at || existing?.last_seen_at || null,
      updated_at: row.updated_at || existing?.updated_at || null,
      last_app_active_at: existing?.last_app_active_at || row.last_seen_at,
      is_online: false,
      _lastAppActiveMs: lastAppActiveMs,
      _lastSeenMs: activityMs
    });
  });

  const now = Date.now();
  return [...merged.values()].map((device) => {
    const activityMs = Math.max(device._lastAppActiveMs, device._lastSeenMs);
    const { _lastAppActiveMs: _a, _lastSeenMs: _b, ...rest } = device;
    return {
      ...rest,
      is_online: activityMs > 0 && now - activityMs <= ONLINE_MS
    };
  });
}

export function dedupeDevicesByHardware(devices: MergedDevice[]) {
  const groups = new Map<string, MergedDevice[]>();
  devices.forEach((device) => {
    const key = deviceStableKey(device);
    const bucket = groups.get(key) || [];
    bucket.push(device);
    groups.set(key, bucket);
  });

  const kept: MergedDevice[] = [];
  groups.forEach((bucket) => {
    const sorted = [...bucket].sort((a, b) => {
      const aMs = Math.max(a.last_app_active_at ? Date.parse(a.last_app_active_at) : 0, a.last_seen_at ? Date.parse(a.last_seen_at) : 0);
      const bMs = Math.max(b.last_app_active_at ? Date.parse(b.last_app_active_at) : 0, b.last_seen_at ? Date.parse(b.last_seen_at) : 0);
      return bMs - aMs;
    });
    const primary = sorted[0];
    kept.push({ ...primary, duplicate_count: sorted.length > 1 ? sorted.length : undefined });
  });

  return kept.sort((a, b) => {
    const aMs = Math.max(a.last_app_active_at ? Date.parse(a.last_app_active_at) : 0, a.last_seen_at ? Date.parse(a.last_seen_at) : 0);
    const bMs = Math.max(b.last_app_active_at ? Date.parse(b.last_app_active_at) : 0, b.last_seen_at ? Date.parse(b.last_seen_at) : 0);
    return bMs - aMs;
  });
}

export async function getMergedDevices(options: { dedupe?: boolean } = {}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { devices: [] as MergedDevice[], duplicateIds: [] as string[] };

  const [tableResult, payloadResult] = await Promise.all([
    supabase.from("v_megacompanion_devices").select("*").order("last_seen_at", { ascending: false, nullsFirst: false }),
    supabase.from("account_sync_state").select("payload").eq("user_id", user.id).maybeSingle()
  ]);

  const tableRows = (tableResult.data || []) as DeviceRow[];
  const payload = parsePayload(payloadResult.data?.payload);
  const payloadDevices = (payload.registeredDevicesById || {}) as Record<string, unknown>;
  const merged = mergeDeviceRows(tableRows, payloadDevices).map((device) => ({ ...device, user_id: user.id }));

  if (!options.dedupe) {
    return { devices: merged, duplicateIds: [] as string[] };
  }

  const deduped = dedupeDevicesByHardware(merged);
  const keptIds = new Set(deduped.map((device) => device.device_id));
  const duplicateIds = merged.filter((device) => !keptIds.has(device.device_id)).map((device) => device.device_id);
  return { devices: deduped, duplicateIds };
}
