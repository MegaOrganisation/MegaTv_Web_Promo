"use client";

import Link from "next/link";

import { useWebProfile } from "@/features/web/WebProfileProvider";
import {
  COLLECTION_RAIL_META,
  collectionCoverUrl,
  tilesForGroup,
  type CollectionGroup
} from "@/lib/web/collection-tiles";

/** Home squircle rails — Services / Genres / Studios (Android collection tiles). */
export function CollectionPosterRail({ group }: { group: CollectionGroup }) {
  const { withProfile } = useWebProfile();
  const meta = COLLECTION_RAIL_META[group];
  const tiles = tilesForGroup(group);
  if (!tiles.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="mega-rail-bar" aria-hidden />
        <h2 className="text-lg font-bold text-[var(--mega-text)]">{meta.title}</h2>
      </div>
      <div className="mega-rail-track flex gap-3 overflow-x-auto px-1 pb-2">
        {tiles.map((tile) => (
          <Link
            key={tile.id}
            href={withProfile(`/web/collection/${encodeURIComponent(tile.id)}`)}
            className="focus-ring group relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-[22%] border border-white/10 bg-[#1a1c1e] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:border-white/35 hover:scale-[1.04] sm:h-[6.25rem] sm:w-[6.25rem]"
            title={tile.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={collectionCoverUrl(tile)}
              alt={tile.title}
              className="h-full w-full object-contain p-2"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
