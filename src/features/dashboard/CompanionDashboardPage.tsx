"use client";

import { useState } from "react";

import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { CinemaHeroCarousel } from "@/features/companion/ui/CinemaHeroCarousel";
import { CompanionDashboardView } from "@/features/dashboard/CompanionDashboardView";
import { DashboardEditHeaderButton } from "@/features/dashboard/DashboardEditHeaderButton";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";
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

  const heroImage = tmdbProxiedImageUrl(
    continueWatching[0]?.backdrop_path || continueWatching[0]?.poster_path || topContent[0]?.backdrop_path || topContent[0]?.poster_path,
    "w780"
  );
  const heroTitle = activeProfile?.name ? `Bonjour, ${activeProfile.name}` : "Votre espace MegaTv";
  const heroSub = `${summary.continue_watching_count} reprises · ${summary.movies_watched} films · ${summary.episodes_watched} épisodes`;

  return (
    <ResponsiveShell
      title="Dashboard"
      subtitle="Métriques, reprises et historique — synchronisés par profil."
      isAdmin={isAdmin}
      continueWatching={continueWatching}
      showRail={false}
      hidePageHeader
      headerEnd={
        activeProfile?.is_kids_profile ? null : (
          <DashboardEditHeaderButton editMode={editMode} onEditModeChange={setEditMode} />
        )
      }
      hero={
        <CinemaHeroCarousel
          items={continueWatching}
          fallbackTitle={heroTitle}
          fallbackSubtitle={heroSub}
          fallbackImage={heroImage}
        />
      }
    >
      <PageEventTracker page="Companion Dashboard" />

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
        isKids={Boolean(activeProfile?.is_kids_profile)}
        editMode={editMode && !activeProfile?.is_kids_profile}
        onEditModeChange={setEditMode}
      />
    </ResponsiveShell>
  );
}
