"use client";

import type { ReactNode } from "react";

import { CompanionProfileProvider } from "@/features/companion/CompanionProfileProvider";
import { useWebProfile } from "@/features/web/WebProfileProvider";

/** Reuses Companion social hub under `/web` with the active web profile scope. */
export function WebCompanionProfileBridge({ children }: { children: ReactNode }) {
  const { profiles, profileAvatarUrlsById } = useWebProfile();
  return (
    <CompanionProfileProvider profiles={profiles} profileAvatarUrlsById={profileAvatarUrlsById}>
      {children}
    </CompanionProfileProvider>
  );
}
