export type DeviceDedupeInput = {
  device_id: string;
  display_name?: string | null;
  default_label?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  device_type?: string | null;
  last_app_active_at?: string | null;
  last_seen_at?: string | null;
  duplicate_count?: number;
};

/**
 * Keep one row per physical device (manufacturer + model + type).
 * Rename does NOT create a second device: when two ids share the same hardware,
 * keep the best row (custom display name, then most recent activity, then aid-*).
 * Losers are omitted from the returned list (see getMergedDevices duplicateIds).
 */
export function dedupeDevicesByHardware<T extends DeviceDedupeInput>(devices: T[]): T[] {
  const byId = new Map<string, T>();
  devices.forEach((device) => {
    const id = (device.device_id || "").trim();
    if (!id) return;
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, { ...device, duplicate_count: undefined });
      return;
    }
    if (deviceActivityMs(device) >= deviceActivityMs(existing)) {
      byId.set(id, { ...device, duplicate_count: undefined });
    }
  });

  const hardwareBuckets = new Map<string, T[]>();
  [...byId.values()].forEach((device) => {
    const key = deviceHardwareKey(device);
    const bucketKey = key || `id:${device.device_id}`;
    const bucket = hardwareBuckets.get(bucketKey) || [];
    bucket.push(device);
    hardwareBuckets.set(bucketKey, bucket);
  });

  const kept: T[] = [];
  hardwareBuckets.forEach((bucket) => {
    if (bucket.length === 1) {
      kept.push(bucket[0]);
      return;
    }
    const ranked = [...bucket].sort((a, b) => deviceKeepScore(b) - deviceKeepScore(a));
    kept.push({ ...ranked[0], duplicate_count: bucket.length });
  });

  return kept.sort((a, b) => deviceActivityMs(b) - deviceActivityMs(a));
}

function deviceHardwareKey(device: {
  manufacturer?: string | null;
  model?: string | null;
  device_type?: string | null;
}) {
  const manufacturer = (device.manufacturer || "").trim().toLowerCase();
  const model = (device.model || "").trim().toLowerCase();
  const type = (device.device_type || "").trim().toLowerCase();
  if (!manufacturer || !model) return "";
  return `${manufacturer}|${model}|${type || "unknown"}`;
}

function deviceActivityMs(device: {
  last_app_active_at?: string | null;
  last_seen_at?: string | null;
}) {
  return Math.max(
    device.last_app_active_at ? Date.parse(device.last_app_active_at) : 0,
    device.last_seen_at ? Date.parse(device.last_seen_at) : 0
  );
}

/** Higher = keep. Custom rename wins over raw hardware label; then recency; then stable aid- ids. */
function deviceKeepScore(device: DeviceDedupeInput) {
  const display = (device.display_name || "").trim();
  const defaultLabel = (device.default_label || "").trim();
  const hasCustomName = Boolean(display && display !== defaultLabel);
  const aidBonus = (device.device_id || "").startsWith("aid-") ? 10_000 : 0;
  return (hasCustomName ? 1_000_000_000 : 0) + deviceActivityMs(device) + aidBonus;
}
