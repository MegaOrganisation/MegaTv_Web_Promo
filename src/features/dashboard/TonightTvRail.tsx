"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Tv } from "lucide-react";
import { clsx } from "clsx";

import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import {
  MAJOR_NETWORKS,
  TONIGHT_COUNTRIES,
  type TonightCountry,
  type TonightProgram
} from "@/lib/tvmaze/tonight";

const COUNTRY_KEY = "megacompanion_tonight_country_v1";

function readCountry(): TonightCountry {
  try {
    const saved = localStorage.getItem(COUNTRY_KEY);
    if (saved && TONIGHT_COUNTRIES.some((c) => c.id === saved)) return saved as TonightCountry;
  } catch {
    /* ignore */
  }
  return "FR";
}

function writeCountry(id: TonightCountry) {
  try {
    localStorage.setItem(COUNTRY_KEY, id);
  } catch {
    /* ignore */
  }
}

type Props = {
  /** Mode compact pour calendrier */
  compact?: boolean;
  className?: string;
};

/** « Ce soir » — programmes des 2–3 plus grandes chaînes du pays (TVMaze), carousel en boucle. */
export function TonightTvRail({ compact = false, className }: Props) {
  const media = useMediaDetailOptional();
  const [country, setCountry] = useState<TonightCountry>("FR");
  const [hydrated, setHydrated] = useState(false);
  const [programs, setPrograms] = useState<TonightProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setCountry(readCountry());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    setLoading(true);
    void fetch(`/api/tvmaze/tonight?country=${country}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const list = Array.isArray(json?.programs) ? (json.programs as TonightProgram[]) : [];
        setPrograms(list);
        setIndex(0);
      })
      .catch(() => {
        if (!cancelled) setPrograms([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country, hydrated]);

  useEffect(() => {
    if (paused || programs.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % programs.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused, programs.length]);

  const current = programs[index] ?? null;
  const channelsHint = useMemo(() => MAJOR_NETWORKS[country].slice(0, 3).join(" · "), [country]);

  const [localDetail, setLocalDetail] = useState<TonightProgram | null>(null);

  const handleOpen = useCallback(
    (program: TonightProgram) => {
      if (program.tmdbId && program.tmdbId > 0) {
        media?.openMediaDetail({
          mediaType: "tv",
          tmdbId: program.tmdbId,
          title: program.title,
          posterUrl: program.posterUrl,
          meta: `${program.network} · ${program.airtime}${
            program.season ? ` · S${program.season}E${program.episode ?? "?"}` : ""
          }`,
          layoutId: `tonight-${program.id}`
        });
        return;
      }
      setLocalDetail(program);
    },
    [media]
  )

  return (
    <section
      className={clsx("tonight-tv", compact && "tonight-tv--compact", className)}
      aria-label="Ce soir à la télé"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="tonight-tv__head">
        <div className="min-w-0">
          <p className="tonight-tv__eyebrow">
            <Tv className="h-3.5 w-3.5" />
            Ce soir
          </p>
          <p className="tonight-tv__channels">{channelsHint}</p>
        </div>
        <select
          className="tonight-tv__country focus-ring"
          value={country}
          aria-label="Pays du guide TV"
          onChange={(e) => {
            const next = e.target.value as TonightCountry;
            setCountry(next);
            writeCountry(next);
          }}
        >
          {TONIGHT_COUNTRIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="tonight-tv__empty">Chargement du guide…</p> : null}
      {!loading && programs.length === 0 ? (
        <p className="tonight-tv__empty">Aucun programme prime-time trouvé pour ce pays ce soir.</p>
      ) : null}

      {current ? (
        <div className="tonight-tv__stage">
          <button
            type="button"
            className="tonight-tv__nav focus-ring"
            aria-label="Programme précédent"
            onClick={() => setIndex((i) => (i - 1 + programs.length) % programs.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <AnimatePresence mode="wait">
            <motion.button
              key={current.id}
              type="button"
              className="tonight-tv__card focus-ring"
              onClick={() => handleOpen(current)}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.35 }}
            >
              <div className="tonight-tv__poster-wrap">
                {current.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <motion.img
                    layoutId={`tonight-${current.id}`}
                    src={current.posterUrl}
                    alt=""
                    className="tonight-tv__poster"
                  />
                ) : (
                  <div className="tonight-tv__poster tonight-tv__poster--empty">
                    <Tv className="h-8 w-8 opacity-40" />
                  </div>
                )}
              </div>
              <div className="tonight-tv__meta">
                <p className="tonight-tv__network">
                  {current.network}
                  <span>{current.airtime}</span>
                </p>
                <p className="tonight-tv__title">{current.title}</p>
                <p className="tonight-tv__sub">
                  {current.season
                    ? `S${current.season} · E${current.episode ?? "?"} · `
                    : null}
                  Appuyer pour le détail
                </p>
              </div>
            </motion.button>
          </AnimatePresence>

          <button
            type="button"
            className="tonight-tv__nav focus-ring"
            aria-label="Programme suivant"
            onClick={() => setIndex((i) => (i + 1) % programs.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {programs.length > 1 ? (
        <div className="tonight-tv__dots" aria-hidden>
          {programs.slice(0, 12).map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={clsx("tonight-tv__dot", i === index && "is-active")}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}

      {localDetail ? (
        <div className="tonight-tv__local-scrim" onClick={() => setLocalDetail(null)} role="presentation">
          <div className="tonight-tv__local-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
            <p className="tonight-tv__network">
              {localDetail.network} · {localDetail.airtime}
            </p>
            <h3 className="tonight-tv__title">{localDetail.title}</h3>
            <p className="tonight-tv__local-summary">{localDetail.summary || "Pas de synopsis pour ce programme."}</p>
            <button type="button" className="mega-spectrum-btn focus-ring mt-4" onClick={() => setLocalDetail(null)}>
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
