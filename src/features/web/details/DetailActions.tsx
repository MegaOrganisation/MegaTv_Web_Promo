"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Check, Eye, Film, Plus, Server } from "lucide-react";
import { useCallback, useState, type ComponentType } from "react";

import { Modal } from "@/features/web/details/Modal";
import { SourcePicker } from "@/features/web/details/SourcePicker";
import { useLocalFlag } from "@/features/web/details/localFlags";
import { MegaTvIcon } from "@/features/web/icons/MegaTvIcon";
import { withProfileQuery } from "@/lib/companion/profile-scope";

type Props = {
  mediaId: string;
  profileId: string;
  title: string;
  /** YouTube key from pickTrailerKey (null → no trailer button). */
  trailerKey: string | null;
};

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  primary = false,
  filled = false
}: {
  icon: ComponentType<{ className?: string; fill?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  primary?: boolean;
  filled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "focus-ring inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:-translate-y-0.5",
        primary
          ? "bg-[var(--mega-text)] text-[var(--mega-background-deep)]"
          : active
            ? "border border-[var(--mega-red)]/50 bg-[var(--mega-red)]/15 text-[var(--mega-text)]"
            : "border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-text)] hover:bg-[var(--mega-surface)]"
      )}
    >
      <Icon className="h-4 w-4" fill={filled ? "currentColor" : "none"} />
      <span>{label}</span>
    </button>
  );
}

/** Floating circular back control — top-left over the hero poster. */
export function DetailBackButton({ profileId }: { profileId: string }) {
  const router = useRouter();

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(withProfileQuery("/web/home", profileId));
  }, [router, profileId]);

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Retour"
      className="focus-ring absolute left-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-xl transition hover:bg-black/60 sm:left-6 sm:top-6"
    >
      <MegaTvIcon name="back" className="h-5 w-5" />
    </button>
  );
}

/** Play / sources / trailer / vu / watchlist — rendered below the poster block. */
export function DetailActionBar({ mediaId, profileId, title, trailerKey }: Props) {
  const router = useRouter();
  const [watched, toggleWatched] = useLocalFlag("watched", profileId, mediaId);
  const [inWatchlist, toggleWatchlist] = useLocalFlag("watchlist", profileId, mediaId);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const playHref = withProfileQuery(`/web/player/${mediaId}`, profileId);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => router.push(playHref)}
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--mega-text)] px-5 py-2.5 text-sm font-bold text-[var(--mega-background-deep)] transition hover:-translate-y-0.5"
        >
          <MegaTvIcon name="play" filled className="h-4 w-4" />
          <span>Lire</span>
        </button>
        <ActionButton icon={Server} label="Sources" onClick={() => setSourcesOpen(true)} />
        {trailerKey ? <ActionButton icon={Film} label="Bande-annonce" onClick={() => setTrailerOpen(true)} /> : null}
        <ActionButton icon={watched ? Check : Eye} label={watched ? "Vu" : "Marquer vu"} active={watched} onClick={toggleWatched} />
        <ActionButton icon={inWatchlist ? Check : Plus} label={inWatchlist ? "Dans ma liste" : "Ma liste"} active={inWatchlist} onClick={toggleWatchlist} />
      </div>

      <SourcePicker open={sourcesOpen} onClose={() => setSourcesOpen(false)} mediaId={mediaId} profileId={profileId} />

      {trailerKey ? (
        <Modal open={trailerOpen} onClose={() => setTrailerOpen(false)} label={`Bande-annonce — ${title}`} size="trailer">
          <div className="overflow-hidden rounded-[24px]">
            <div className="aspect-video w-full bg-black">
              {trailerOpen ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                  title={`Bande-annonce ${title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

/** @deprecated Use DetailBackButton + DetailActionBar */
export function DetailActions(props: Props) {
  return (
    <>
      <DetailActionBar {...props} />
    </>
  );
}
