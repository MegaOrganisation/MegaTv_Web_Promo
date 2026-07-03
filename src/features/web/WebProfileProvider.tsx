"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import { withProfileQuery } from "@/lib/companion/profile-scope";
import type { ProfileRow } from "@/lib/supabase/types";

type WebProfileContextValue = {
  profiles: ProfileRow[];
  profileAvatarUrlsById: Record<string, string>;
  activeProfileId: string | null;
  activeProfile: ProfileRow | null;
  /** Appends the active `?profile=` to any web href so navigation stays scoped. */
  withProfile: (href: string) => string;
};

const WebProfileContext = createContext<WebProfileContextValue | null>(null);

export function WebProfileProvider({
  profiles,
  profileAvatarUrlsById = {},
  children
}: {
  profiles: ProfileRow[];
  profileAvatarUrlsById?: Record<string, string>;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const activeProfileId = searchParams.get("profile")?.trim() || null;

  const activeProfile = useMemo(
    () => (activeProfileId ? profiles.find((profile) => profile.profile_id === activeProfileId) || null : null),
    [activeProfileId, profiles]
  );

  const withProfile = useCallback((href: string) => withProfileQuery(href, activeProfileId), [activeProfileId]);

  const value = useMemo(
    () => ({ profiles, profileAvatarUrlsById, activeProfileId, activeProfile, withProfile }),
    [profiles, profileAvatarUrlsById, activeProfileId, activeProfile, withProfile]
  );

  return <WebProfileContext.Provider value={value}>{children}</WebProfileContext.Provider>;
}

export function useWebProfile() {
  const context = useContext(WebProfileContext);
  if (!context) {
    return {
      profiles: [] as ProfileRow[],
      profileAvatarUrlsById: {} as Record<string, string>,
      activeProfileId: null,
      activeProfile: null,
      withProfile: (href: string) => href
    } satisfies WebProfileContextValue;
  }
  return context;
}
