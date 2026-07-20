import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  badge?: string;
  children?: ReactNode;
};

import { CompanionCanvasImg } from "@/features/companion/ui/CompanionCanvasImg";

/** Hero unique par page — titre sur bandeau blur dégradé (MovieHub). */
export function CinemaHero({ title, subtitle, imageUrl, badge, children }: Props) {
  return (
    <section className="mega-cinema-hero mb-6 sm:mb-8">
      <div className="mega-cinema-hero__frame">
        {imageUrl ? (
          <>
            <CompanionCanvasImg src={imageUrl} alt="" className="mega-cinema-hero__img" />
            <div className="mega-cinema-poster__blur-cap mega-cinema-hero__blur" aria-hidden="true">
              <CompanionCanvasImg src={imageUrl} alt="" className="mega-cinema-poster__blur-img" />
            </div>
          </>
        ) : (
          <div className="mega-cinema-hero__fallback" aria-hidden="true" />
        )}
        <div className="mega-cinema-hero__rim" aria-hidden="true" />
        <div className="mega-cinema-hero__content">
          {badge ? <span className="mega-cinema-poster__chip">{badge}</span> : null}
          <h2 className="mega-cinema-hero__title">{title}</h2>
          {subtitle ? <p className="mega-cinema-hero__sub">{subtitle}</p> : null}
          {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
