"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { readStoredProfileId, writeStoredProfileId, withProfileQuery } from "@/lib/companion/profile-scope";
import type { ProfileRow } from "@/lib/supabase/types";

type CompanionProfileContextValue = {
  profiles: ProfileRow[];
  profileAvatarUrlsById: Record<string, string>;
  activeProfileId: string | null;
  activeProfile: ProfileRow | null;
  setActiveProfileId: (profileId: string | null) => void;
  withProfile: (href: string) => string;
};

const CompanionProfileContext = createContext<CompanionProfileContextValue | null>(null);

export function CompanionProfileProvider({
  profiles,
  profileAvatarUrlsById = {},
  children
}: {
  profiles: ProfileRow[];
  profileAvatarUrlsById?: Record<string, string>;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlProfileId = searchParams.get("profile")?.trim() || null;

  const activeProfile = useMemo(
    () => (urlProfileId ? profiles.find((profile) => profile.profile_id === urlProfileId) || null : null),
    [urlProfileId, profiles]
  );

  useEffect(() => {
    const stored = readStoredProfileId();
    if (urlProfileId) {
      writeStoredProfileId(urlProfileId);
      return;
    }
    if (stored) {
      router.replace(withProfileQuery(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""), stored));
    }
  }, [pathname, router, searchParams, urlProfileId]);

  const setActiveProfileId = useCallback(
    (profileId: string | null) => {
      writeStoredProfileId(profileId);
      const next = withProfileQuery(
        pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""),
        profileId
      );
      router.push(next);
      router.refresh();
    },
    [pathname, router, searchParams]
  );

  const withProfile = useCallback((href: string) => withProfileQuery(href, urlProfileId), [urlProfileId]);

  const value = useMemo(
    () => ({
      profiles,
      profileAvatarUrlsById,
      activeProfileId: urlProfileId,
      activeProfile,
      setActiveProfileId,
      withProfile
    }),
    [profiles, profileAvatarUrlsById, urlProfileId, activeProfile, setActiveProfileId, withProfile]
  );

  /* Toujours rendre les children — return null provoquait crash hooks / page Gérer KO. */
  return <CompanionProfileContext.Provider value={value}>{children}</CompanionProfileContext.Provider>;
}

export function useCompanionProfile() {
  const context = useContext(CompanionProfileContext);
  if (!context) {
    return {
      profiles: [] as ProfileRow[],
      profileAvatarUrlsById: {} as Record<string, string>,
      activeProfileId: null,
      activeProfile: null,
      setActiveProfileId: () => undefined,
      withProfile: (href: string) => href
    };
  }
  return context;
}
