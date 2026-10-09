"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Check, Eye, Film, Heart, Plus, Server, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
  logoUrl?: string | null;
  /** YouTube key from pickTrailerKey (null → no trailer button). */
  trailerKey: string | null;
};

// Particles radiating in 360 degrees inspired by WatchlistPosterCelebration.kt
const CELEBRATION_PARTICLES = [
  { id: 1, angle: 0, distance: 50, color: "#EC268F", size: 7, shape: "star" },
  { id: 2, angle: 30, distance: 64, color: "#E50914", size: 6, shape: "dot" },
  { id: 3, angle: 60, distance: 54, color: "#F59E0B", size: 8, shape: "sparkle" },
  { id: 4, angle: 90, distance: 70, color: "#EC268F", size: 7, shape: "heart" },
  { id: 5, angle: 120, distance: 58, color: "#8B5CF6", size: 6, shape: "dot" },
  { id: 6, angle: 150, distance: 66, color: "#E50914", size: 8, shape: "star" },
  { id: 7, angle: 180, distance: 50, color: "#10B981", size: 6, shape: "sparkle" },
  { id: 8, angle: 210, distance: 62, color: "#EC268F", size: 7, shape: "dot" },
  { id: 9, angle: 240, distance: 56, color: "#F59E0B", size: 8, shape: "heart" },
  { id: 10, angle: 270, distance: 68, color: "#E50914", size: 7, shape: "star" },
  { id: 11, angle: 300, distance: 52, color: "#8B5CF6", size: 6, shape: "sparkle" },
  { id: 12, angle: 330, distance: 64, color: "#EC268F", size: 7, shape: "dot" }
];

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
        "focus-ring inline-flex items-center gap-2 rounded-full transition",
        primary
          ? "mega-btn-primary min-h-11 px-5 py-2.5 text-sm"
          : active
            ? "min-h-11 border border-[var(--mega-red)]/50 bg-[var(--mega-red)]/15 px-5 py-2.5 text-sm font-bold text-[var(--mega-text)]"
            : "mega-btn-ghost min-h-11 px-5 py-2.5 text-sm"
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
export function DetailActionBar({ mediaId, profileId, title, logoUrl, trailerKey }: Props) {
  const router = useRouter();
  const [watched, toggleWatched] = useLocalFlag("watched", profileId, mediaId);
  const [inWatchlist, toggleWatchlist] = useLocalFlag("watchlist", profileId, mediaId);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  // Celebration state on adding to watchlist (parity with WatchlistPosterCelebration.kt)
  const [celebrationToken, setCelebrationToken] = useState(0);

  const handleWatchlistClick = () => {
    if (!inWatchlist) {
      // Trigger festive celebration burst when adding
      setCelebrationToken((t) => t + 1);
    }
    toggleWatchlist();
  };

  const playHref = withProfileQuery(`/web/player/${mediaId}`, profileId);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => router.push(playHref)}
          className="focus-ring mega-btn-primary min-h-11 px-5 py-2.5 text-sm"
        >
          <MegaTvIcon name="play" filled className="h-4 w-4" />
          <span>Lire</span>
        </button>

        <ActionButton icon={Server} label="Sources" onClick={() => setSourcesOpen(true)} />

        {trailerKey ? (
          <ActionButton icon={Film} label="Bande-annonce" onClick={() => setTrailerOpen(true)} primary={false} />
        ) : null}

        <ActionButton
          icon={watched ? Check : Eye}
          label={watched ? "Vu" : "Marquer vu"}
          active={watched}
          onClick={toggleWatched}
        />

        {/* Watchlist button with celebration particles and micro-bounce */}
        <div className="relative inline-flex items-center">
          <motion.button
            type="button"
            key={`btn-${celebrationToken}`}
            onClick={handleWatchlistClick}
            animate={
              celebrationToken > 0
                ? {
                    scale: [1, 0.9, 1.16, 0.96, 1.04, 1],
                    transition: { duration: 0.52, ease: "easeOut" }
                  }
                : { scale: 1 }
            }
            whileTap={{ scale: 0.92 }}
            className={clsx(
              "focus-ring inline-flex items-center gap-2 rounded-full transition min-h-11 px-5 py-2.5 text-sm",
              inWatchlist
                ? "border border-[#EC268F]/60 bg-[#EC268F]/20 text-white font-bold shadow-[0_0_18px_rgba(236,38,143,0.35)]"
                : "mega-btn-ghost hover:border-[#EC268F]/40"
            )}
          >
            {inWatchlist ? (
              <Check className="h-4 w-4 text-[#EC268F]" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{inWatchlist ? "Dans ma liste" : "Ma liste"}</span>
          </motion.button>

          {/* Celebration Burst Overlay */}
          <AnimatePresence>
            {celebrationToken > 0 && (
              <div
                key={`burst-${celebrationToken}`}
                className="pointer-events-none absolute inset-0 -m-8 flex items-center justify-center z-30"
              >
                {/* Expanding Glowing Shockwave Ring */}
                <motion.div
                  initial={{ scale: 0.4, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                  className="absolute h-16 w-16 rounded-full border-2 border-[#EC268F] bg-[radial-gradient(circle,rgba(236,38,143,0.35)_0%,transparent_70%)]"
                />

                {/* Floating Heart in the center */}
                <motion.div
                  initial={{ scale: 0.5, y: 0, opacity: 1 }}
                  animate={{ scale: 1.35, y: -26, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute text-[#EC268F]"
                >
                  <Heart className="h-6 w-6" fill="currentColor" />
                </motion.div>

                {/* Radiating Confetti Particles */}
                {CELEBRATION_PARTICLES.map((p) => {
                  const rad = (p.angle * Math.PI) / 180;
                  const targetX = Math.cos(rad) * p.distance;
                  const targetY = Math.sin(rad) * p.distance;

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                      animate={{
                        x: targetX,
                        y: targetY,
                        scale: [0, 1.4, 0.8, 0],
                        opacity: [1, 1, 0.8, 0]
                      }}
                      transition={{ duration: 0.65, ease: "easeOut" }}
                      className="absolute"
                      style={{ color: p.color }}
                    >
                      {p.shape === "heart" ? (
                        <Heart className="h-3 w-3" fill="currentColor" />
                      ) : p.shape === "sparkle" ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : (
                        <div
                          className="rounded-full shadow-sm"
                          style={{
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SourcePicker
        open={sourcesOpen}
        onClose={() => setSourcesOpen(false)}
        mediaId={mediaId}
        profileId={profileId}
        title={title}
        logoUrl={logoUrl}
      />

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
