import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Shared hero/detail backdrop shell — same height token and TMDB cover treatment. */
export function MediaHeroBackdrop({
  src,
  alt,
  children,
  chromeHidden = false,
  className
}: {
  src: string | null;
  alt: string;
  children?: ReactNode;
  chromeHidden?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("mega-hero-shell relative w-full overflow-hidden", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="web-fade-in h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-[var(--mega-surface)]" />
      )}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          chromeHidden ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,10,0.92)_0%,rgba(6,7,10,0.55)_45%,rgba(6,7,10,0.1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,10,0.9)_0%,transparent_55%)]" />
      </div>
      {children}
    </div>
  );
}
