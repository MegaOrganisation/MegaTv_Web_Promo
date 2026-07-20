"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { motion } from "motion/react";

import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";
import type { ContinueWatchingRow } from "@/lib/supabase/types";

type Props = {
  items?: ContinueWatchingRow[];
};

export function CinemaMobileRail({ items: initialItems }: Props) {
  const { withProfile } = useCompanionProfile();
  const media = useMediaDetailOptional();
  const [items, setItems] = useState<ContinueWatchingRow[]>(initialItems ?? []);

  useEffect(() => {
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
  }, [initialItems]);

  if (items.length === 0) return null;

  return (
    <section className="mega-cinema-mobile-rail mt-6 xl:hidden" aria-label="Continuer à regarder">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-white/90">Continuer à regarder</h2>
        <Link href={withProfile("/companion")} className="text-xs font-semibold text-[var(--brand-blue)]">
          Dashboard →
        </Link>
      </div>
      <div className="mega-cinema-mobile-rail-scroll flex gap-3 overflow-x-auto pb-1">
        {items.slice(0, 6).map((item) => {
          const img = tmdbProxiedImageUrl(item.backdrop_path || item.poster_path, "w342");
          const poster = tmdbProxiedImageUrl(item.poster_path, "w185");
          const layoutId = `media-${item.media_type}-${item.tmdb_id}`;
          return (
            <motion.button
              key={item.track_id}
              type="button"
              className="mega-cinema-mobile-rail-card shrink-0 text-left focus-ring"
              onClick={() => {
                if (!item.tmdb_id) return;
                media?.openMediaDetail({
                  mediaType: item.media_type,
                  tmdbId: item.tmdb_id,
                  title: item.title || `TMDB ${item.tmdb_id}`,
                  posterUrl: poster,
                  backdropUrl: img,
                  meta: item.media_type === "tv" ? "Série" : "Film",
                  layoutId
                });
              }}
            >
              <motion.div layoutId={layoutId} className="mega-cinema-mobile-rail-media overflow-hidden">
                {img ? <CompanionCanvasImg src={img} alt="" className="h-full w-full object-cover" /> : null}
                <div className="mega-cinema-poster__blur-cap mega-cinema-mobile-rail-blur" aria-hidden="true">
                  {img ? <CompanionCanvasImg src={img} alt="" className="mega-cinema-poster__blur-img" /> : null}
                </div>
                <div className="mega-cinema-mobile-rail-caption">
                  <p className="truncate text-xs font-bold text-white">{item.title || `TMDB ${item.tmdb_id}`}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/65">
                    <Play className="h-3 w-3" />
                    Reprendre
                  </p>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
