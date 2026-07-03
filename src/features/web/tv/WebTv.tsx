"use client";

import { clsx } from "clsx";
import { ChevronDown, ChevronUp, ImageOff, LayoutGrid, ListVideo, Search, SquarePen, Star, Tv } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Spinner, SpinnerOverlay } from "@/features/web/Spinner";
import { TvLivePlayer } from "@/features/web/tv/TvLivePlayer";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import type { IptvCategory, IptvChannel } from "@/lib/web/iptv-channels";
import type { EpgMap, EpgNowNext } from "@/lib/web/iptv-epg";
import { seedFavoritesIfEmpty, useIptvFavorites } from "@/lib/web/iptv-favorites";

type ChannelsPayload = {
  configured: boolean;
  channels: IptvChannel[];
  categories: IptvCategory[];
  epgUrls: string[];
  favoriteChannels: string[];
  capped: boolean;
  total: number;
  errors: { listId: string; name: string; message: string }[];
  signature: string;
  scope: string;
};

const PAGE_SIZE = 300;
const CHANNELS_CACHE_TTL = 10 * 60 * 1000;
const EPG_CACHE_TTL = 15 * 60 * 1000;
const FAV_DEBOUNCE_MS = 2500;

const channelsCacheKey = (p: string) => `megatv_web_iptv_cache_${p}`;
const epgCacheKey = (p: string) => `megatv_web_iptv_epg_${p}`;

function readCache<T>(key: string, ttl: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: T };
    if (Date.now() - parsed.at > ttl) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ at: Date.now(), value }));
  } catch {
    /* ignore quota */
  }
}

function formatSlot(slot: EpgNowNext["now"]) {
  if (!slot) return null;
  const start = new Date(slot.start);
  const hh = String(start.getHours()).padStart(2, "0");
  const mm = String(start.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} · ${slot.title}`;
}

export function WebTv({ profileId }: { profileId: string }) {
  const { withProfile } = useWebProfile();
  const { favorites, toggle, reorder } = useIptvFavorites(profileId);

  const [payload, setPayload] = useState<ChannelsPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IptvChannel | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [epg, setEpg] = useState<EpgMap>({});

  // ---- Favorites batch push (Free Tier: never per toggle) --------------------
  const dirtyRef = useRef(false);
  const favoritesRef = useRef<string[]>(favorites);
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  const pushFavorites = useCallback(
    (ids: string[]) => {
      dirtyRef.current = false;
      fetch("/api/web/iptv/favorites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile: profileId, favoriteChannels: ids }),
        keepalive: true
      }).catch(() => undefined);
    },
    [profileId]
  );

  const onToggleFav = useCallback(
    (id: string) => {
      dirtyRef.current = true;
      toggle(id);
    },
    [toggle]
  );

  const onReorder = useCallback(
    (order: string[]) => {
      dirtyRef.current = true;
      reorder(order);
    },
    [reorder]
  );

  // Debounced push after any favorites change.
  useEffect(() => {
    if (!dirtyRef.current) return;
    const timer = setTimeout(() => pushFavorites(favoritesRef.current), FAV_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [favorites, pushFavorites]);

  // Flush on tab hide / unmount so a single batch write always lands.
  useEffect(() => {
    const flush = () => {
      if (!dirtyRef.current) return;
      const body = JSON.stringify({ profile: profileId, favoriteChannels: favoritesRef.current });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/web/iptv/favorites", new Blob([body], { type: "application/json" }));
        dirtyRef.current = false;
      } else {
        pushFavorites(favoritesRef.current);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
    };
  }, [profileId, pushFavorites]);

  const applyPayload = useCallback(
    (data: ChannelsPayload) => {
      setPayload(data);
      setStatus(data.configured ? "ready" : "empty");
      seedFavoritesIfEmpty(profileId, data.favoriteChannels);
      // Land on Favorites when the profile already has some.
      if (data.configured && favoritesRef.current.length > 0) setActiveCat("fav");
    },
    [profileId]
  );

  // ---- Channel load (localStorage-first, then network) -----------------------
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const cached = readCache<ChannelsPayload>(channelsCacheKey(profileId), CHANNELS_CACHE_TTL);
      if (cached) {
        if (!cancelled) applyPayload(cached);
        return; // fresh cache → no network
      }
      try {
        const res = await fetch(`/api/web/iptv/channels?profile=${encodeURIComponent(profileId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ChannelsPayload;
        if (cancelled) return;
        applyPayload(data);
        if (data.configured) writeCache(channelsCacheKey(profileId), data);
      } catch {
        if (cancelled) return;
        setErrorMsg("Impossible de charger les chaînes.");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, applyPayload]);

  // ---- EPG lazy load (only if a playlist exposes an EPG url) -----------------
  useEffect(() => {
    if (status !== "ready" || !payload || payload.epgUrls.length === 0) return;
    let cancelled = false;
    void (async () => {
      const cached = readCache<EpgMap>(epgCacheKey(profileId), EPG_CACHE_TTL);
      if (cached) {
        if (!cancelled) setEpg(cached);
        return;
      }
      try {
        const res = await fetch(`/api/web/iptv/epg?profile=${encodeURIComponent(profileId)}`);
        const json = res.ok ? ((await res.json()) as { epg: EpgMap }) : { epg: {} };
        if (cancelled) return;
        setEpg(json.epg);
        writeCache(epgCacheKey(profileId), json.epg);
      } catch {
        /* EPG is optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, payload, profileId]);

  const channelById = useMemo(() => {
    const map = new Map<string, IptvChannel>();
    payload?.channels.forEach((c) => map.set(c.id, c));
    return map;
  }, [payload]);

  const categories = useMemo(() => {
    const base: IptvCategory[] = [
      { id: "fav", label: "Favoris", count: favorites.length },
      { id: "all", label: "Toutes les chaînes", count: payload?.total ?? 0 }
    ];
    return [...base, ...(payload?.categories ?? [])];
  }, [favorites.length, payload]);

  const filtered = useMemo(() => {
    if (!payload) return [] as IptvChannel[];
    let list: IptvChannel[];
    if (activeCat === "fav") {
      list = favorites.map((id) => channelById.get(id)).filter((c): c is IptvChannel => Boolean(c));
    } else if (activeCat === "all") {
      list = payload.channels;
    } else {
      const label = activeCat.startsWith("grp:") ? activeCat.slice(4) : activeCat;
      list = payload.channels.filter((c) => c.group === label);
    }
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
    return list;
  }, [payload, activeCat, favorites, channelById, search]);

  const selectCategory = useCallback((id: string) => {
    setActiveCat(id);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const visible = filtered.slice(0, visibleCount);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const moveFavorite = useCallback(
    (id: string, dir: -1 | 1) => {
      const idx = favorites.indexOf(id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= favorites.length) return;
      const next = [...favorites];
      [next[idx], next[target]] = [next[target], next[idx]];
      onReorder(next);
    },
    [favorites, onReorder]
  );

  if (status === "loading") return <SpinnerOverlay label="Chargement des chaînes…" />;

  if (status === "empty") {
    return (
      <EmptyState
        title="IPTV non configuré"
        message="Ajoutez une playlist M3U ou Xtream depuis MegaCompagnon (Gérer → IPTV) pour ce profil, puis revenez ici."
        cta={{ href: withProfile("/companion/manage/iptv"), label: "Configurer IPTV" }}
      />
    );
  }

  if (status === "error" || !payload) {
    return <EmptyState title="Erreur de chargement" message={errorMsg || "Réessayez dans un instant."} />;
  }

  const isFav = activeCat === "fav";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Category sidebar */}
        <aside className="lg:w-60 lg:shrink-0">
          <div className="mega-glass rounded-2xl p-2 lg:sticky lg:top-5">
            <div className="flex gap-1 overflow-x-auto lg:max-h-[70vh] lg:flex-col lg:overflow-y-auto">
              {categories.map((cat) => {
                const active = cat.id === activeCat;
                const Icon = cat.id === "fav" ? Star : cat.id === "all" ? LayoutGrid : ListVideo;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategory(cat.id)}
                    className={clsx(
                      "focus-ring flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition lg:w-full",
                      active
                        ? "bg-[var(--mega-card-bg)] text-[var(--mega-text)] shadow-[inset_0_0_0_1px_var(--mega-border-strong)]"
                        : "text-[var(--mega-text-muted)] hover:bg-[var(--mega-card-bg)] hover:text-[var(--mega-text)]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" fill={cat.id === "fav" && active ? "currentColor" : "none"} />
                    <span className="min-w-0 flex-1 truncate">{cat.label}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-[var(--mega-text-faint)]">{cat.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="min-w-0 flex-1 space-y-4">
          {selected ? (
            <TvLivePlayer
              key={selected.id}
              channel={selected}
              subtitle={formatSlot(selected.tvgId ? epg[selected.tvgId]?.now : null) || selected.group}
              onClose={() => setSelected(null)}
            />
          ) : null}

          {payload.capped ? (
            <p className="rounded-xl border border-[var(--mega-yellow)]/30 bg-[var(--mega-yellow)]/10 px-3 py-2 text-xs text-[var(--mega-yellow)]">
              Liste volumineuse tronquée pour la fluidité — affinez avec la recherche ou les catégories.
            </p>
          ) : null}
          {payload.errors.length > 0 ? (
            <p className="rounded-xl border border-[var(--mega-red)]/30 bg-[var(--mega-red)]/10 px-3 py-2 text-xs text-[var(--mega-red)]">
              {payload.errors.map((e) => `${e.name || "Liste"} : ${e.message}`).join(" · ")}
            </p>
          ) : null}

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mega-text-faint)]" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filtrer les chaînes…"
                className="focus-ring h-11 w-full rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] pl-10 pr-4 text-sm text-[var(--mega-text)] outline-none transition focus:border-[var(--mega-border-strong)]"
                aria-label="Filtrer les chaînes"
              />
            </div>
            {isFav && favorites.length > 1 ? (
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className={clsx(
                  "focus-ring inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                  editMode
                    ? "border-[var(--mega-border-strong)] bg-[var(--mega-card-bg)] text-[var(--mega-text)]"
                    : "border-[var(--mega-border)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
                )}
              >
                <SquarePen className="h-4 w-4" /> {editMode ? "Terminer" : "Réorganiser"}
              </button>
            ) : null}
          </div>

          {/* Grid */}
          {visible.length === 0 ? (
            <EmptyState
              inline
              title={isFav ? "Aucun favori" : "Aucune chaîne"}
              message={isFav ? "Marquez des chaînes avec l'étoile pour les retrouver ici." : "Aucune chaîne dans cette catégorie."}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((channel, index) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  nowNext={channel.tvgId ? epg[channel.tvgId] : undefined}
                  isFavorite={favoriteSet.has(channel.id)}
                  isPlaying={selected?.id === channel.id}
                  editMode={editMode && isFav}
                  canMoveUp={index > 0}
                  canMoveDown={index < visible.length - 1}
                  onPlay={() => setSelected(channel)}
                  onToggleFav={() => onToggleFav(channel.id)}
                  onMoveUp={() => moveFavorite(channel.id, -1)}
                  onMoveDown={() => moveFavorite(channel.id, 1)}
                />
              ))}
            </div>
          )}

          {visibleCount < filtered.length ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border)] px-5 py-2.5 text-sm font-semibold text-[var(--mega-text-muted)] transition hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
              >
                <Spinner size="sm" /> Afficher plus ({filtered.length - visibleCount})
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ChannelCard({
  channel,
  nowNext,
  isFavorite,
  isPlaying,
  editMode,
  canMoveUp,
  canMoveDown,
  onPlay,
  onToggleFav,
  onMoveUp,
  onMoveDown
}: {
  channel: IptvChannel;
  nowNext?: EpgNowNext;
  isFavorite: boolean;
  isPlaying: boolean;
  editMode: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onPlay: () => void;
  onToggleFav: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const now = formatSlot(nowNext?.now ?? null);
  return (
    <div
      className={clsx(
        "group/ch relative overflow-hidden rounded-2xl border bg-[var(--mega-surface)] transition duration-300 hover:scale-[1.03] hover:shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]",
        isPlaying ? "border-[var(--mega-red)]" : "border-[var(--mega-border)] hover:border-[var(--mega-border-strong)]"
      )}
    >
      <button type="button" onClick={onPlay} className="focus-ring flex w-full items-center gap-3 p-3 text-left">
        <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--mega-input-bg)]">
          {channel.logo ? (
            <Image src={channel.logo} alt="" width={48} height={48} unoptimized className="h-full w-full object-contain" />
          ) : (
            <Tv className="h-5 w-5 text-[var(--mega-text-faint)]" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            {isPlaying ? (
              <span className="inline-flex items-center rounded-full bg-[var(--mega-red)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Live</span>
            ) : null}
            <span className="truncate text-sm font-semibold text-[var(--mega-text)]">{channel.name}</span>
          </span>
          {now ? (
            <span className="mt-0.5 block truncate text-[11px] text-[var(--mega-text-faint)]">{now}</span>
          ) : (
            <span className="mt-0.5 block truncate text-[11px] text-[var(--mega-text-faint)]">{channel.group}</span>
          )}
        </span>
      </button>

      {/* Favorite / reorder controls */}
      <div className="absolute right-2 top-2 flex items-center gap-1">
        {editMode ? (
          <>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              aria-label="Monter"
              className="focus-ring grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              aria-label="Descendre"
              className="focus-ring grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onToggleFav}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={clsx(
              "focus-ring grid h-7 w-7 place-items-center rounded-full backdrop-blur transition",
              isFavorite
                ? "bg-[var(--mega-yellow)]/20 text-[var(--mega-yellow)]"
                : "bg-black/30 text-white/70 opacity-0 hover:text-white group-hover/ch:opacity-100 focus-visible:opacity-100"
            )}
          >
            <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  message,
  cta,
  inline
}: {
  title: string;
  message: string;
  cta?: { href: string; label: string };
  inline?: boolean;
}) {
  return (
    <div
      className={clsx(
        "mega-glass mx-auto flex max-w-lg flex-col items-center gap-4 rounded-[28px] p-10 text-center",
        inline ? "mt-2" : "mt-6"
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--mega-card-bg)] text-[var(--mega-text)]">
        <ImageOff className="h-7 w-7" />
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-[var(--mega-text)]">{title}</p>
        <p className="text-sm text-[var(--mega-text-muted)]">{message}</p>
      </div>
      {cta ? (
        <Link
          href={cta.href}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-card-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--mega-text)] transition hover:bg-[var(--mega-surface-raised)]"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
