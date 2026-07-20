"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Play, Tv } from "lucide-react";

import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import type { ContinueWatchingRow } from "@/lib/supabase/types";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";

/** F1 — carte « Ce soir » : meilleure reprise du profil. */
export function TonightPickCard({ items }: { items: ContinueWatchingRow[] }) {
  const { withProfile } = useCompanionProfile();
  const media = useMediaDetailOptional();
  const pick = items[0];
  if (!pick) return null;

  const poster = tmdbProxiedImageUrl(pick.poster_path, "w185");
  const backdrop = tmdbProxiedImageUrl(pick.backdrop_path || pick.poster_path, "w500");
  const layoutId = `media-${pick.media_type}-${pick.tmdb_id}`;
  const meta =
    pick.media_type === "tv" && pick.season
      ? `S${pick.season} · E${pick.episode ?? 1}`
      : pick.media_type === "tv"
        ? "Série"
        : "Film";
  const playerHref = withProfile(
    `/web/player/${pick.media_type}-${pick.tmdb_id}${pick.season ? `?season=${pick.season}&episode=${pick.episode ?? 1}` : ""}`
  );

  function openDetail() {
    if (!pick.tmdb_id) return;
    media?.openMediaDetail({
      mediaType: pick.media_type as "movie" | "tv",
      tmdbId: pick.tmdb_id,
      title: pick.title || `TMDB ${pick.tmdb_id}`,
      posterUrl: poster,
      backdropUrl: backdrop,
      meta,
      layoutId
    });
  }

  return (
    <section className="tonight-pick mb-4 sm:mb-6" aria-label="Ce soir">
      <div className="tonight-pick__card">
        {backdrop ? (
          <div className="tonight-pick__bg" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={backdrop} alt="" className="tonight-pick__bg-img" />
          </div>
        ) : null}
        <div className="tonight-pick__body">
          <button type="button" className="tonight-pick__poster-hit focus-ring" onClick={openDetail} aria-label={`Détail ${pick.title || pick.tmdb_id}`}>
            {poster ? (
              <motion.div layoutId={layoutId}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={poster} alt="" className="tonight-pick__poster" />
              </motion.div>
            ) : (
              <div className="tonight-pick__poster tonight-pick__poster--empty">
                <Play className="h-5 w-5" />
              </div>
            )}
          </button>
          <div className="tonight-pick__meta min-w-0 flex-1">
            <p className="tonight-pick__eyebrow">Ce soir</p>
            <button type="button" className="text-left" onClick={openDetail}>
              <p className="tonight-pick__title">{pick.title || `TMDB ${pick.tmdb_id}`}</p>
            </button>
            <p className="tonight-pick__sub">{meta} · reprise recommandée</p>
          </div>
          <div className="tonight-pick__actions">
            <Link href={playerHref} className="mega-spectrum-btn focus-ring tonight-pick__cta">
              <Play className="h-4 w-4 fill-current" />
              Regarder
            </Link>
            <Link
              href={withProfile("/companion/devices")}
              className="focus-ring tonight-pick__tv"
              title="Lancer sur TV"
            >
              <Tv className="h-4 w-4" />
              <span className="sr-only">Lancer sur TV</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
