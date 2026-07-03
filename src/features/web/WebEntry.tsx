"use client";

import { useCallback, useSyncExternalStore } from "react";

import { WebIntro } from "@/features/web/WebIntro";
import { WebProfileGate } from "@/features/web/WebProfileGate";
import type { ProfileRow } from "@/lib/supabase/types";

const SESSION_KEY = "megatv_web_intro_played";
const INTRO_EVENT = "megatv-web-intro";

function readPlayed(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Web boot flow: play the MegaTv intro once per browser session, then hand off
 * to the profile gate. Internal navigations back to `/web` (e.g. switching
 * profile) skip the intro (sessionStorage flag), per `intro_video_demarrage`.
 */
export function WebEntry({ profiles }: { profiles: ProfileRow[] }) {
  const subscribe = useCallback((onChange: () => void) => {
    const handler = () => onChange();
    window.addEventListener(INTRO_EVENT, handler);
    return () => window.removeEventListener(INTRO_EVENT, handler);
  }, []);

  // "pending" on the server / first client paint, then the real value → avoids
  // hydration mismatch and never sets state synchronously in an effect.
  const phase = useSyncExternalStore(
    subscribe,
    () => (readPlayed() ? "gate" : "intro"),
    () => "pending" as const
  );

  const finishIntro = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(INTRO_EVENT));
  };

  if (phase === "pending") {
    return <div className="fixed inset-0 bg-[var(--mega-background-deep)]" />;
  }

  if (phase === "intro") {
    return <WebIntro onFinished={finishIntro} />;
  }

  return (
    <main className="grid min-h-screen w-full place-items-center px-6 py-16">
      <WebProfileGate profiles={profiles} />
    </main>
  );
}
