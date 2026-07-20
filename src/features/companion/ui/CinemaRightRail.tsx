"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { motion } from "motion/react";

import { MegaTvIcon } from "@/components/icons/MegaTvIcon";
import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";
import { ScrollableRail } from "@/features/companion/ui/ScrollableRail";
import type { CompanionRailVariant } from "@/features/companion/navigation/companionNavConfig";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { cinemaSpringSnappy } from "@/features/companion/motion/cinemaMotion";
import type { ContinueWatchingRow } from "@/lib/supabase/types";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";

type Props = {
  variant: CompanionRailVariant;
  items?: ContinueWatchingRow[];
  embedded?: boolean;
};

/**
 * Carte Reprendre — parité TV Infuse :
 * poster portrait à gauche + fond paysage transparent + barre progression coins ronds.
 */
function RailContinueCard({
  item,
  index
}: {
  item: ContinueWatchingRow;
  index: number;
}) {
  const media = useMediaDetailOptional();
  const backdrop = tmdbProxiedImageUrl(item.backdrop_path || item.poster_path, "w500");
  const poster = tmdbProxiedImageUrl(item.poster_path, "w185");
  const layoutId = `media-${item.media_type}-${item.tmdb_id}`;
  const meta =
    item.media_type === "tv" && item.season
      ? `S${item.season} · E${item.episode ?? 1}${item.episode_title ? ` — ${item.episode_title}` : ""}`
      : item.media_type === "tv"
        ? "Série"
        : "Film";
  const progress =
    item.progress != null && item.progress > 0
      ? Math.min(99, Math.round(item.progress <= 1 ? item.progress * 100 : item.progress))
      : null;

  function openDetail() {
    if (!item.tmdb_id) return;
    media?.openMediaDetail({
      mediaType: item.media_type as "movie" | "tv",
      tmdbId: item.tmdb_id,
      title: item.title || `TMDB ${item.tmdb_id}`,
      posterUrl: poster,
      backdropUrl: backdrop,
      meta,
      layoutId
    });
  }

  return (
    <motion.article
      className="rail-cw-infuse text-left"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...cinemaSpringSnappy, delay: index * 0.04 }}
    >
      <div className="rail-cw-infuse__shell">
        {backdrop ? (
          <div className="rail-cw-infuse__backdrop" aria-hidden>
            <CompanionCanvasImg src={backdrop} alt="" className="rail-cw-infuse__backdrop-img" />
          </div>
        ) : null}
        <button
          type="button"
          className="rail-cw-infuse__poster rail-cw-infuse__poster--hit focus-ring group"
          onClick={openDetail}
          aria-label={`Ouvrir ${item.title || `TMDB ${item.tmdb_id}`}`}
        >
          <motion.div layoutId={layoutId} className="rail-cw-infuse__poster-zoom">
            {poster ? (
              <CompanionCanvasImg src={poster} alt="" className="rail-cw-infuse__poster-img" />
            ) : (
              <div className="rail-cw-infuse__poster-fallback">
                <Play className="h-5 w-5 fill-white/40 text-white/40" />
              </div>
            )}
          </motion.div>
        </button>
        <div className="rail-cw-infuse__meta">
          <button type="button" className="rail-cw-infuse__title-btn" onClick={openDetail}>
            <p className="rail-cw-infuse__title">{item.title || `TMDB ${item.tmdb_id}`}</p>
          </button>
          <p className="rail-cw-infuse__sub">
            <Play className="h-3 w-3 shrink-0 fill-current" />
            <span className="truncate">{meta}</span>
          </p>
          <div className="rail-cw-infuse__progress" aria-hidden>
            <div className="rail-cw-infuse__progress-fill" style={{ width: `${progress ?? 8}%` }} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function CinemaContextRail({ variant, items: initialItems, embedded = false }: Props) {
  const { withProfile } = useCompanionProfile();
  const [items, setItems] = useState<ContinueWatchingRow[]>(initialItems ?? []);

  useEffect(() => {
    if (variant !== "dashboard") return;
    if (initialItems?.length) {
      setItems(initialItems);
      return;
    }
    let cancelled = false;
    void fetch("/api/companion/continue-watching")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((json: { items?: ContinueWatchingRow[] }) => {
        if (!cancelled) setItems(json.items ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialItems, variant]);

  const body = renderVariantBody(variant, { items: items.slice(0, 6), withProfile });

  if (embedded) {
    return <div className="cinema-rail-embedded" aria-label="Rail contextuel">{body}</div>;
  }

  return (
    <aside className="mega-cinema-rail hidden xl:block" aria-label="Rail contextuel">
      {body}
    </aside>
  );
}

function renderVariantBody(
  variant: CompanionRailVariant,
  ctx: {
    items: ContinueWatchingRow[];
    withProfile: (href: string) => string;
  }
) {
  const { items, withProfile } = ctx;

  switch (variant) {
    case "dashboard":
      return (
        <div className="cinema-rail-panel cinema-rail-panel--stretch">
          <h2 className="mega-cinema-rail-title">Reprendre</h2>
          {items.length === 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-[var(--mega-text-muted)]">Aucune reprise pour ce profil.</p>
          ) : (
            <ScrollableRail axis="y" className="mt-3 space-y-2.5 pj1-rail-scroll">
              {items.map((item, index) => (
                <RailContinueCard key={item.track_id} item={item} index={index} />
              ))}
            </ScrollableRail>
          )}
          <div className="cinema-rail-panel__footer mt-auto flex flex-wrap items-center gap-2 pt-3">
            <Link
              href={withProfile("/companion/calendar")}
              className="focus-ring cinema-rail-link inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
            >
              <MegaTvIcon name="calendar" size={15} />
              Calendrier
            </Link>
            <Link
              href={withProfile("/companion/devices")}
              className="focus-ring cinema-rail-link inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mega-text-muted)] hover:text-[var(--brand-gold)]"
              title="Lancer sur TV"
            >
              <MegaTvIcon name="cast" size={15} />
              Sur TV
            </Link>
          </div>
        </div>
      );

    case "watchlist":
      return (
        <div className="cinema-rail-panel">
          <h2 className="mega-cinema-rail-title">Sync</h2>
          <div className="mt-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/50 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold text-[var(--mega-text)]">
              <MegaTvIcon name="cloud" size={16} />
              Sync cloud
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--mega-text-muted)]">
              Watchlist profil-scopée — delta batch à la sortie d&apos;édition. Tri via les filtres en haut.
            </p>
          </div>
        </div>
      );

    case "manage":
      return (
        <div className="cinema-rail-panel">
          <h2 className="mega-cinema-rail-title">Sync</h2>
          <div className="mt-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/50 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold text-[var(--mega-text)]">
              <MegaTvIcon name="cloud" size={16} />
              État cloud
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--mega-text-muted)]">IPTV / addons / catalogues — batch only.</p>
          </div>
          <Link href={withProfile("/companion/manage/iptv")} className="focus-ring mt-3 inline-flex items-center gap-2 text-xs font-semibold">
            <MegaTvIcon name="tv" size={16} />
            Playlists →
          </Link>
        </div>
      );

    case "settings":
      return (
        <div className="cinema-rail-panel">
          <h2 className="mega-cinema-rail-title">Appareils</h2>
          <p className="mt-2 text-xs text-[var(--mega-text-muted)]">TV, mobile et sessions web.</p>
          <Link
            href={withProfile("/companion/devices")}
            className="focus-ring mt-3 inline-flex items-center gap-2 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/50 px-3 py-2.5 text-xs font-semibold"
          >
            <MegaTvIcon name="cast" size={16} />
            Pairer une TV
          </Link>
        </div>
      );

    case "profiles":
      return (
        <div className="cinema-rail-panel">
          <h2 className="mega-cinema-rail-title">Kids</h2>
          <div className="mt-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)]/50 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold">
              <MegaTvIcon name="lock" size={16} />
              PIN profil
            </div>
            <p className="text-[11px] text-[var(--mega-text-muted)]">Verrouillage Kids sync Android / TV.</p>
          </div>
        </div>
      );

    case "admin":
      return (
        <div className="cinema-rail-panel">
          <h2 className="mega-cinema-rail-title">Ops</h2>
          <div className="mt-3 space-y-2">
            <Link href={withProfile("/companion/admin/releases")} className="v10-rail-chip focus-ring block">
              Releases OTA
            </Link>
            <Link href={withProfile("/companion/admin/platform")} className="v10-rail-chip focus-ring block">
              Plateforme
            </Link>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/** @deprecated */
export function CinemaRightRail(props: Omit<Props, "variant"> & { showCalendar?: boolean }) {
  return <CinemaContextRail variant="dashboard" {...props} />;
}
