"use client";

import { useState } from "react";

import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { CompanionDashboardView } from "@/features/dashboard/CompanionDashboardView";
import { DashboardEditHeaderButton } from "@/features/dashboard/DashboardEditHeaderButton";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { SelectedProfileBanner } from "@/features/dashboard/SelectedProfileBanner";
import type { ContinueWatchingRow, DashboardSummary, ProfileRow, TopContentRow } from "@/lib/supabase/types";
import type { WatchHistoryRow } from "@/lib/dashboard/watch-data";

type Props = {
  summary: DashboardSummary;
  topContent: TopContentRow[];
  continueWatching: ContinueWatchingRow[];
  watchHistory: WatchHistoryRow[];
  activeProfileId: string | null;
  activeProfile: ProfileRow | null;
  profileAvatarUrlsById: Record<string, string>;
  isAdmin: boolean;
  errors: string[];
};

export function CompanionDashboardPage({
  summary,
  topContent,
  continueWatching,
  watchHistory,
  activeProfileId,
  activeProfile,
  profileAvatarUrlsById,
  isAdmin,
  errors
}: Props) {
  const [editMode, setEditMode] = useState(false);

  return (
    <ResponsiveShell
      title="Dashboard"
      subtitle="Vos métriques MegaTv, isolées par compte et profil grâce à Supabase RLS."
      isAdmin={isAdmin}
      headerEnd={<DashboardEditHeaderButton editMode={editMode} onEditModeChange={setEditMode} />}
    >
      <PageEventTracker page="Companion Dashboard" />

      <SelectedProfileBanner activeProfile={activeProfile} avatarUrl={activeProfile ? profileAvatarUrlsById[activeProfile.profile_id] : null} summary={summary} />

      {errors.length > 0 ? (
        <GlassCard className="mb-6 border-yellow-300/20 bg-yellow-300/8">
          <p className="text-sm font-semibold text-yellow-100">Certaines données ne sont pas encore disponibles.</p>
          <p className="mt-1 text-xs text-yellow-100/65">Appliquez la migration MegaCompagnon et vérifiez les variables Supabase si les blocs restent vides.</p>
        </GlassCard>
      ) : null}

      <CompanionDashboardView
        summary={summary}
        topContent={topContent}
        continueWatching={continueWatching}
        watchHistory={watchHistory}
        activeProfileId={activeProfileId}
        editMode={editMode}
        onEditModeChange={setEditMode}
      />
    </ResponsiveShell>
  );
}
