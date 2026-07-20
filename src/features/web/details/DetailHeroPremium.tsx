"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { ReactNode } from "react";

import { DetailBackButton } from "@/features/web/details/DetailActions";
import { MediaHeroBackdrop } from "@/features/web/MediaHeroBackdrop";

type Props = {
  profileId: string;
  title: string;
  backdrop: string | null;
  posterUrl: string | null;
  logoUrl: string | null;
  year: string;
  runtime: string | null;
  rating: number | null;
  mediaType: "movie" | "tv";
  genres: { id: number; name: string }[];
  director?: string | null;
  children: ReactNode;
};

/** Detail hero — backdrop + panneau glass (mobile-first, pas de clip overflow). */
export function DetailHeroPremium({
  profileId,
  title,
  backdrop,
  posterUrl,
  logoUrl,
  year,
  runtime,
  rating,
  mediaType,
  genres,
  director,
  children
}: Props) {
  const cover = backdrop || posterUrl;

  return (
    <section className="mega-detail-hero relative">
      <div className="mega-detail-hero-backdrop relative min-h-[14rem] sm:min-h-[18rem]">
        <MediaHeroBackdrop src={cover} alt={title} className="mega-detail-backdrop" />
        <DetailBackButton profileId={profileId} />
      </div>

      <div className="mega-detail-hero-panel mega-pro-glass relative z-[2] -mt-8 mx-0 rounded-[var(--mega-dialog-radius)] p-4 sm:-mt-12 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="w-[8.5rem] shrink-0 sm:w-[9.5rem]">
            <div className="mega-poster-shell mega-pro-poster-glow overflow-hidden shadow-[0_24px_48px_-20px_rgba(0,0,0,0.85)]">
              <div className="relative aspect-[2/3] w-full">
                {posterUrl ? (
                  <Image src={posterUrl} alt={title} fill unoptimized sizes="152px" className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-[var(--mega-surface)]" />
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0 w-full flex-1 text-center sm:text-left">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={title}
                className="mx-auto mb-2 max-h-16 max-w-[min(100%,20rem)] object-contain sm:mx-0 sm:max-h-20"
              />
            ) : (
              <h1 className="line-clamp-3 text-xl font-black leading-tight text-[var(--mega-text)] sm:text-3xl">{title}</h1>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--mega-text-muted)] sm:justify-start sm:text-sm">
              {year ? <span>{year}</span> : null}
              {runtime ? <span>· {runtime}</span> : null}
              {rating != null ? (
                <span className="inline-flex items-center gap-1">
                  · <Star className="h-3.5 w-3.5 text-[var(--mega-accent-bright)]" fill="currentColor" /> {rating.toFixed(1)}
                </span>
              ) : null}
              <span className="mega-chip-muted">{mediaType === "tv" ? "Série" : "Film"}</span>
            </div>

            {director ? <p className="mt-1 text-xs text-[var(--mega-text-faint)]">Réal. {director}</p> : null}

            {genres.length ? (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {genres.slice(0, 4).map((genre) => (
                  <span key={genre.id} className="mega-chip-muted">
                    {genre.name}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
