"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Tv, X } from "lucide-react";
import { clsx } from "clsx";

import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { IptvChannelLogo } from "@/features/web/tv/IptvChannelLogo";
import {
  TONIGHT_COUNTRIES,
  type TonightChannelOption,
  type TonightCountry,
  type TonightProgram
} from "@/lib/tvmaze/tonight";

const COUNTRY_KEY = "megacompanion_tonight_country_v1";
const CHANNEL_KEY = "megacompanion_tonight_channel_v1";

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

function readChannel(country: TonightCountry): string {
  try {
    return localStorage.getItem(`${CHANNEL_KEY}_${country}`) || "";
  } catch {
    return "";
  }
}

function writeChannel(country: TonightCountry, id: string) {
  try {
    localStorage.setItem(`${CHANNEL_KEY}_${country}`, id);
    localStorage.setItem(CHANNEL_KEY, id);
  } catch {
    /* ignore */
  }
}

type Props = {
  compact?: boolean;
  className?: string;
};

/** Programme TV — pays + chaîne en menus déroulants. */
export function TonightTvRail({ compact = false, className }: Props) {
  const media = useMediaDetailOptional();
  const [country, setCountry] = useState<TonightCountry>("FR");
  const [channelId, setChannelId] = useState("");
  const [channels, setChannels] = useState<TonightChannelOption[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [programs, setPrograms] = useState<TonightProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localDetail, setLocalDetail] = useState<TonightProgram | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = readCountry();
    setCountry(c);
    setChannelId(readChannel(c));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!countryOpen && !channelOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!filtersRef.current?.contains(event.target as Node)) {
        setCountryOpen(false);
        setChannelOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCountryOpen(false);
        setChannelOpen(false);
        setLocalDetail(null);
      }
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [countryOpen, channelOpen]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    setLoading(true);
    const qs = new URLSearchParams({ country });
    if (channelId) qs.set("channel", channelId);
    void fetch(`/api/tvmaze/tonight?${qs.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const list = Array.isArray(json?.programs) ? (json.programs as TonightProgram[]) : [];
        const chans = Array.isArray(json?.channels) ? (json.channels as TonightChannelOption[]) : [];
        setChannels(chans);
        setPrograms(list);
        setActiveId(list[0]?.id ?? null);

        if (chans.length === 0) return;
        const stillValid = channelId && chans.some((c) => c.id === channelId);
        if (!stillValid) {
          const fallback = chans[0]!.id;
          setChannelId(fallback);
          writeChannel(country, fallback);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPrograms([]);
          setActiveId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country, channelId, hydrated]);

  const currentCountry = TONIGHT_COUNTRIES.find((c) => c.id === country) || TONIGHT_COUNTRIES[0]!;
  const current = useMemo(
    () => programs.find((p) => p.id === activeId) || programs[0] || null,
    [programs, activeId]
  );
  const list = useMemo(() => programs.slice(0, compact ? 4 : 10), [programs, compact]);

  const handleOpen = useCallback(
    (program: TonightProgram) => {
      if (program.tmdbId && program.tmdbId > 0) {
        media?.openMediaDetail({
          mediaType: "tv",
          tmdbId: program.tmdbId,
          title: program.title,
          posterUrl: program.posterUrl,
          meta: `${program.network} · ${program.airtime}`,
          layoutId: `tonight-${program.id}`
        });
        return;
      }
      setLocalDetail(program);
    },
    [media]
  );

  const activeChannel = channels.find((c) => c.id === channelId);

  return (
    <section
      className={clsx("tonight-tv tonight-tv--program", compact && "tonight-tv--compact", className)}
      aria-label="Programme TV"
    >
      <div className="tonight-tv__head">
        <div className="min-w-0">
          <p className="tonight-tv__eyebrow">
            <Tv className="h-3.5 w-3.5" />
            Programme
          </p>
          <p className="tonight-tv__channels">{activeChannel?.name || "Guide TV"}</p>
        </div>

        <div className="tonight-tv__filters" ref={filtersRef}>
          <button
            type="button"
            className="tonight-tv__country-btn focus-ring"
            aria-haspopup="listbox"
            aria-expanded={countryOpen}
            aria-label="Pays du guide TV"
            onClick={() => {
              setCountryOpen((v) => !v);
              setChannelOpen(false);
            }}
          >
            <span className="tonight-tv__flag-badge" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentCountry.flagSrc} alt="" className="tonight-tv__flag-img" width={22} height={16} />
            </span>
            <span className="tonight-tv__country-label">{currentCountry.label}</span>
            <ChevronDown className={clsx("h-3.5 w-3.5 opacity-70 transition", countryOpen && "rotate-180")} />
          </button>

          <button
            type="button"
            className="tonight-tv__channel-btn focus-ring"
            aria-haspopup="listbox"
            aria-expanded={channelOpen}
            aria-label="Chaîne du guide TV"
            disabled={channels.length === 0}
            onClick={() => {
              setChannelOpen((v) => !v);
              setCountryOpen(false);
            }}
          >
            <span className="tonight-tv__channel-logo" aria-hidden>
              <IptvChannelLogo
                src={activeChannel?.logoUrl ?? null}
                className="h-full w-full object-contain"
                fallback={<span className="text-[9px] font-extrabold">{(activeChannel?.name || "TV").slice(0, 3)}</span>}
              />
            </span>
            <span className="tonight-tv__channel-label">{activeChannel?.name || "Chaîne"}</span>
            <ChevronDown className={clsx("h-3.5 w-3.5 opacity-70 transition", channelOpen && "rotate-180")} />
          </button>

          {countryOpen ? (
            <ul className="tonight-tv__country-menu" role="listbox" aria-label="Choisir un pays">
              {TONIGHT_COUNTRIES.map((c) => (
                <li key={c.id} role="option" aria-selected={c.id === country}>
                  <button
                    type="button"
                    className={clsx("tonight-tv__country-option", c.id === country && "is-active")}
                    onClick={() => {
                      setCountry(c.id);
                      writeCountry(c.id);
                      setChannelId("");
                      writeChannel(c.id, "");
                      setCountryOpen(false);
                    }}
                  >
                    <span className="tonight-tv__flag-badge" aria-hidden>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.flagSrc} alt="" className="tonight-tv__flag-img" width={22} height={16} />
                    </span>
                    <span>{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {channelOpen ? (
            <ul className="tonight-tv__channel-menu" role="listbox" aria-label="Choisir une chaîne">
              {channels.map((c) => (
                <li key={c.id} role="option" aria-selected={c.id === channelId}>
                  <button
                    type="button"
                    className={clsx("tonight-tv__channel-option", c.id === channelId && "is-active")}
                    onClick={() => {
                      setChannelId(c.id);
                      writeChannel(country, c.id);
                      setChannelOpen(false);
                    }}
                  >
                    <span className="tonight-tv__channel-logo" aria-hidden>
                      <IptvChannelLogo
                        src={c.logoUrl}
                        className="h-full w-full object-contain"
                        fallback={<span className="text-[9px] font-extrabold">{c.name.slice(0, 3)}</span>}
                      />
                    </span>
                    <span className="truncate">{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {loading ? <p className="tonight-tv__empty">Chargement du guide…</p> : null}
      {!loading && programs.length === 0 ? (
        <p className="tonight-tv__empty">Aucun programme pour cette chaîne — choisis-en une autre.</p>
      ) : null}

      {current ? (
        <div className="tonight-tv__program">
          <button type="button" className="tonight-tv__hero focus-ring" onClick={() => handleOpen(current)}>
            <div className="tonight-tv__hero-media">
              {current.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.posterUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                <div className="tonight-tv__hero-empty" />
              )}
            </div>
            <div className="tonight-tv__hero-meta">
              <p className="tonight-tv__network">
                {activeChannel?.logoUrl ? (
                  <IptvChannelLogo src={activeChannel.logoUrl} className="tonight-tv__network-logo" />
                ) : null}
                <span>{current.network}</span>
              </p>
              <p className="tonight-tv__title">{current.title}</p>
              <p className="tonight-tv__sub">
                {current.airtime}
                {current.endTime ? ` – ${current.endTime}` : ""}
                {current.season && current.episode ? ` · S${current.season}E${current.episode}` : ""}
              </p>
            </div>
          </button>

          <div className="tonight-tv__list">
            {list.map((p) => (
              <button
                key={p.id}
                type="button"
                className={clsx("tonight-tv__row focus-ring", p.id === current.id && "is-active")}
                onClick={() => {
                  setActiveId(p.id);
                  handleOpen(p);
                }}
              >
                <div className="tonight-tv__row-thumb">
                  {p.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.posterUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="tonight-tv__row-title">{p.title}</p>
                  <p className="tonight-tv__row-sub">{p.network}</p>
                </div>
                <span className="tonight-tv__row-time">{p.airtime}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {localDetail ? (
        <div
          className="tonight-tv__local-scrim"
          role="dialog"
          aria-modal="true"
          onClick={() => setLocalDetail(null)}
        >
          <div className="tonight-tv__local-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="tonight-tv__local-close focus-ring"
              onClick={() => setLocalDetail(null)}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
            {localDetail.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={localDetail.posterUrl} alt="" className="tonight-tv__local-poster" />
            ) : null}
            <h3 className="mt-3 pr-8 text-lg font-bold">{localDetail.title}</h3>
            <p className="text-sm text-[var(--mega-text-muted)]">
              {localDetail.network} · {localDetail.airtime}
            </p>
            {localDetail.summary ? <p className="tonight-tv__local-summary">{localDetail.summary}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
