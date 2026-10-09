"use client";

import { useEffect, useRef, useState } from "react";

import { useWebProfile } from "@/features/web/WebProfileProvider";
import { mergeCloudIntoPrefs, prefsToCloudPatch } from "@/lib/web/prefs-cloud";
import { useWebPrefs, type WebPrefs } from "@/lib/web/prefs";

const HYDRATED = "megatv_web_prefs_hydrated_";
const PUSH_DEBOUNCE_MS = 2500;

/**
 * One-shot MegaCloud hydrate + debounced push for shared appearance prefs
 * (layout / trailer). LocalStorage stays authoritative for instant UI; cloud
 * batch keeps Android / Companion / Web aligned (Free Tier: ≤1 pull + debounced push).
 */
export function WebPrefsCloudSync() {
  const { activeProfileId } = useWebProfile();
  const { prefs, update } = useWebPrefs(activeProfileId);
  const lastPushed = useRef<string>("");
  const hydrateDone = useRef<string | null>(null);
  const [readyToPush, setReadyToPush] = useState(false);

  // Hydrate once per profile session (skip if already hydrated this tab).
  useEffect(() => {
    if (!activeProfileId) return;
    if (hydrateDone.current === activeProfileId) return;
    hydrateDone.current = activeProfileId;
    setReadyToPush(false);

    let cancelled = false;
    (async () => {
      try {
        const already =
          typeof window !== "undefined" &&
          sessionStorage.getItem(`${HYDRATED}${activeProfileId}`) === "1";
        if (!already) {
          const res = await fetch(`/api/companion/settings?profileId=${encodeURIComponent(activeProfileId)}`, {
            cache: "no-store"
          });
          if (res.ok && !cancelled) {
            const data = (await res.json()) as { settings?: Record<string, unknown> };
            const merged = mergeCloudIntoPrefs(prefs, data.settings || {});
            lastPushed.current = JSON.stringify(prefsToCloudPatch(merged));
            if (
              merged.layout !== prefs.layout ||
              merged.trailerAutoplay !== prefs.trailerAutoplay ||
              merged.trailerSound !== prefs.trailerSound
            ) {
              update({
                layout: merged.layout,
                trailerAutoplay: merged.trailerAutoplay,
                trailerSound: merged.trailerSound
              });
            }
            sessionStorage.setItem(`${HYDRATED}${activeProfileId}`, "1");
          }
        } else {
          lastPushed.current = JSON.stringify(prefsToCloudPatch(prefs));
        }
      } catch {
        /* offline / free-tier — local prefs still work */
      } finally {
        if (!cancelled) setReadyToPush(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally only re-run on profile change (not every prefs tick).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId]);

  // Debounced cloud push when shared appearance keys change (after hydrate).
  useEffect(() => {
    if (!activeProfileId || !readyToPush) return;
    const patch = prefsToCloudPatch(prefs);
    const signature = JSON.stringify(patch);
    if (signature === lastPushed.current) return;

    const timer = window.setTimeout(() => {
      lastPushed.current = signature;
      void pushAppearance(activeProfileId, prefs);
    }, PUSH_DEBOUNCE_MS);

    const flush = () => {
      window.clearTimeout(timer);
      if (signature !== lastPushed.current) {
        lastPushed.current = signature;
        void pushAppearance(activeProfileId, prefs);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
    };
  }, [activeProfileId, readyToPush, prefs.layout, prefs.trailerAutoplay, prefs.trailerSound, prefs]);

  return null;
}

async function pushAppearance(profileId: string, prefs: WebPrefs) {
  try {
    // Pull-then-merge so we never wipe unrelated Companion/Android keys with a sparse push.
    const getRes = await fetch(`/api/companion/settings?profileId=${encodeURIComponent(profileId)}`, {
      cache: "no-store"
    });
    const existing =
      getRes.ok ? (((await getRes.json()) as { settings?: Record<string, unknown> }).settings || {}) : {};
    const settings = { ...existing, ...prefsToCloudPatch(prefs) };
    await fetch("/api/companion/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, settings }),
      keepalive: true
    });
  } catch {
    /* non-fatal */
  }
}
