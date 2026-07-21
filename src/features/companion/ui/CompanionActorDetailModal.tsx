"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { User, X } from "lucide-react";

import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";
import type { WebPerson } from "@/app/api/web/person/route";

type Props = {
  personId: number | null;
  fallbackName: string;
  onClose: () => void;
};

type State = { status: "loading" } | { status: "ready"; person: WebPerson } | { status: "error" };

const cache = new Map<number, WebPerson>();

/** Fiche acteur Companion — bio + filmo cliquable → flip détail film/série. */
export function CompanionActorDetailModal({ personId, fallbackName, onClose }: Props) {
  const media = useMediaDetailOptional();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (personId == null) return;
    let active = true;
    const load = async () => {
      const cached = cache.get(personId);
      if (cached) {
        if (active) setState({ status: "ready", person: cached });
        return;
      }
      if (active) setState({ status: "loading" });
      try {
        const res = await fetch(`/api/web/person?personId=${personId}`);
        if (!res.ok) throw new Error("http");
        const data = (await res.json()) as { person?: WebPerson };
        if (!active) return;
        if (!data.person) {
          setState({ status: "error" });
          return;
        }
        cache.set(personId, data.person);
        setState({ status: "ready", person: data.person });
      } catch {
        if (active) setState({ status: "error" });
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [personId]);

  useEffect(() => {
    if (personId == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [personId, onClose]);

  if (!mounted || personId == null) return null;

  const person = state.status === "ready" ? state.person : null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="companion-actor-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="companion-actor-panel"
          role="dialog"
          aria-modal
          aria-label={person?.name || fallbackName}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="companion-actor-close focus-ring" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>

          {state.status === "loading" ? (
            <p className="companion-actor-empty">Chargement de la fiche…</p>
          ) : null}
          {state.status === "error" ? (
            <p className="companion-actor-empty">Impossible de charger {fallbackName}.</p>
          ) : null}

          {person ? (
            <>
              <div className="companion-actor-head">
                <div className="companion-actor-photo">
                  {person.profileUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tmdbProxiedImageUrl(person.profileUrl, "w342") || person.profileUrl} alt="" />
                  ) : (
                    <User className="h-8 w-8 opacity-40" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="companion-actor-eyebrow">Acteur</p>
                  <h2 className="companion-actor-name">{person.name}</h2>
                  <p className="companion-actor-meta">
                    {[person.birthday ? `Né(e) le ${person.birthday}` : null, person.placeOfBirth]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {person.biography ? <p className="companion-actor-bio">{person.biography}</p> : null}
                </div>
              </div>

              {person.credits.length > 0 ? (
                <div className="companion-actor-filmo">
                  <h3>Filmographie</h3>
                  <div className="companion-actor-grid">
                    {person.credits.map((credit) => {
                      const poster =
                        tmdbProxiedImageUrl(credit.posterUrl, "w185") || credit.posterUrl;
                      const layoutId = `actor-credit-${credit.mediaType}-${credit.tmdbId}`;
                      return (
                        <button
                          key={credit.mediaId}
                          type="button"
                          className="companion-actor-credit focus-ring"
                          title={credit.title}
                          onClick={() => {
                            media?.openMediaDetail({
                              mediaType: credit.mediaType,
                              tmdbId: credit.tmdbId,
                              title: credit.title,
                              posterUrl: poster,
                              meta: credit.character || credit.year,
                              layoutId
                            });
                          }}
                        >
                          <div className="companion-actor-credit__poster">
                            {poster ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={poster} alt="" loading="lazy" />
                            ) : (
                              <span>{credit.mediaType === "tv" ? "TV" : "F"}</span>
                            )}
                          </div>
                          <p className="companion-actor-credit__title">{credit.title}</p>
                          {credit.year ? <p className="companion-actor-credit__year">{credit.year}</p> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
