import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/supabase/types";
import { dedupeDevicesByHardware } from "@/lib/devices/dedupe";

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

function mergeDeviceRows(tableRows: DeviceRow[], payloadDevices: Record<string, unknown>) {
  const merged = new Map<string, MergedDevice & { _lastAppActiveMs: number; _lastSeenMs: number }>();

  // Table rows are the source of truth for presence. Index hardware first so payload
  // ghosts (old UUID after aid- migration) are not reintroduced as separate devices.
  const tableHardware = new Set<string>();
  tableRows.forEach((row) => {
    const key = `${(row.manufacturer || "").trim().toLowerCase()}|${(row.model || "").trim().toLowerCase()}|${(row.device_type || "").trim().toLowerCase() || "unknown"}`;
    if (!key.startsWith("|") && key !== "||unknown") tableHardware.add(key);
  });

  tableRows.forEach((row) => {
    const lastSeenMs = row.last_seen_at ? Date.parse(row.last_seen_at) : 0;
    merged.set(row.device_id, {
      user_id: row.user_id,
      device_id: row.device_id,
      display_name: row.display_name || "",
      default_label: row.default_label || "",
      device_type: row.device_type || "unknown",
      manufacturer: row.manufacturer || "",
      model: row.model || "",
      app_version: row.app_version || "",
      first_seen_at: row.first_seen_at || null,
      last_seen_at: row.last_seen_at || null,
      updated_at: row.updated_at || null,
      last_app_active_at: row.last_seen_at,
      is_online: false,
      _lastAppActiveMs: 0,
      _lastSeenMs: lastSeenMs
    });
  });

  for (const [deviceId, raw] of Object.entries(payloadDevices)) {
    if (!raw || typeof raw !== "object") continue;
    if (merged.has(deviceId)) {
      const entry = raw as Record<string, unknown>;
      const existing = merged.get(deviceId)!;
      const lastAppActiveMs = Number(entry.lastAppActiveAt || 0);
      const lastSeenMs = Math.max(Number(entry.lastSeenAt || 0), lastAppActiveMs, existing._lastSeenMs);
      merged.set(deviceId, {
        ...existing,
        display_name: existing.display_name || String(entry.displayName || ""),
        default_label: existing.default_label || String(entry.defaultLabel || ""),
        last_app_active_at: toIsoFromMs(lastAppActiveMs) || existing.last_app_active_at,
        last_seen_at: toIsoFromMs(lastSeenMs) || existing.last_seen_at,
        _lastAppActiveMs: lastAppActiveMs,
        _lastSeenMs: lastSeenMs
      });
      continue;
    }
    const entry = raw as Record<string, unknown>;
    const manufacturer = String(entry.manufacturer || "");
    const model = String(entry.model || "");
    const deviceType = String(entry.deviceType || "unknown");
    const hwKey = `${manufacturer.trim().toLowerCase()}|${model.trim().toLowerCase()}|${deviceType.trim().toLowerCase() || "unknown"}`;
    // Skip payload-only ghost when SQL already has the same hardware under a newer id.
    if (tableHardware.has(hwKey)) continue;
    const lastAppActiveMs = Number(entry.lastAppActiveAt || 0);
    const lastSeenMs = Math.max(Number(entry.lastSeenAt || 0), lastAppActiveMs);
    merged.set(deviceId, {
      user_id: "",
      device_id: deviceId,
      display_name: String(entry.displayName || ""),
      default_label: String(entry.defaultLabel || ""),
      device_type: deviceType,
      manufacturer,
      model,
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

export { dedupeDevicesByHardware };

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
