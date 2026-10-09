import type { WebLayout, WebPrefs } from "@/lib/web/prefs";

/**
 * Maps MegaCloud profile settings blob ↔ web prefs (shared with Android / Companion).
 * `navLayout` stays web-local (desktop chrome only). `language` stays local until full i18n.
 *
 * Cloud keys (same as Companion ManageSettingsPanel / Android CloudProfileSettings):
 * - card_layout_mode: portrait | landscape
 * - trailer_auto_play / trailer_sound_enabled
 */
export type CloudAppearancePatch = {
  card_layout_mode?: string;
  trailer_auto_play?: boolean;
  trailer_sound_enabled?: boolean;
};

export function layoutFromCloud(raw: unknown): WebLayout | null {
  if (raw === "landscape") return "landscape";
  if (raw === "portrait" || raw === "poster") return "poster";
  return null;
}

export function layoutToCloud(layout: WebLayout): "portrait" | "landscape" {
  return layout === "landscape" ? "landscape" : "portrait";
}

/** Merge cloud appearance into local prefs. Local wins when `localTouched` is set. */
export function mergeCloudIntoPrefs(
  local: WebPrefs,
  cloud: Record<string, unknown> | null | undefined,
  options?: { preferLocal?: boolean }
): WebPrefs {
  if (!cloud || options?.preferLocal) return local;
  const layout = layoutFromCloud(cloud.card_layout_mode);
  return {
    ...local,
    layout: layout ?? local.layout,
    trailerAutoplay:
      typeof cloud.trailer_auto_play === "boolean" ? cloud.trailer_auto_play : local.trailerAutoplay,
    trailerSound:
      typeof cloud.trailer_sound_enabled === "boolean"
        ? cloud.trailer_sound_enabled
        : local.trailerSound
  };
}

/** Fields to push (partial merge on server — Companion POST replaces settings_json slice fields). */
export function prefsToCloudPatch(prefs: WebPrefs): CloudAppearancePatch {
  return {
    card_layout_mode: layoutToCloud(prefs.layout),
    trailer_auto_play: prefs.trailerAutoplay,
    trailer_sound_enabled: prefs.trailerSound
  };
}
