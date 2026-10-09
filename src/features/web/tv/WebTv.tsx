"use client";

import { clsx } from "clsx";
import { ArrowUpRight, ChevronDown, ChevronUp, ImageOff, LayoutGrid, ListVideo, RefreshCw, Search, SquarePen, Star, Tv, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Spinner, SpinnerOverlay } from "@/features/web/Spinner";
import { IptvChannelLogo } from "@/features/web/tv/IptvChannelLogo";
import { TvLivePlayer } from "@/features/web/tv/TvLivePlayer";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import type { IptvCategory, IptvChannel } from "@/lib/web/iptv-channels";
import { remapFavoriteChannelIds } from "@/lib/web/iptv-channels";
import type { EpgMap, EpgNowNext } from "@/lib/web/iptv-epg";
import { seedFavoritesIfEmpty, useIptvFavorites } from "@/lib/web/iptv-favorites";
import {
  flushIptvChannelWatchNow,
  onIptvChannelChanged,
  onIptvChannelPausedOrLeft,
  setChannelWatchProfile
} from "@/lib/web/channel-watch-tracker";

type ChannelsPayload = {
  configured: boolean;
  channels: IptvChannel[];
  categories: IptvCategory[];
  epgUrls: string[];
  favoriteChannels: string[];
  hiddenCategories?: string[];
  hiddenChannels?: string[];
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

const channelsCacheKey = (p: string) => `megatv_web_iptv_cache_v3_${p}`;
const epgCacheKey = (p: string) => `megatv_web_iptv_epg_${p}`;

function readCache<T extends { errors?: unknown[]; channels?: unknown[] } | unknown>(key: string, ttl: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: T };
    if (Date.now() - parsed.at > ttl) return null;
    // Discard cache if it contains any errors
    const val = parsed.value as { errors?: unknown[]; channels?: unknown[] } | null;
    if (val && Array.isArray(val.errors) && val.errors.length > 0) {
      window.localStorage.removeItem(key);
      return null;
    }
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
  const { favorites, toggle, reorder, setAll } = useIptvFavorites(profileId);

  const searchParams = useSearchParams();
  const urlChannelId = searchParams?.get("channel");

  const [payload, setPayload] = useState<ChannelsPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IptvChannel | null>(null);
  const [isPiP, setIsPiP] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [epg, setEpg] = useState<EpgMap>({});

  const playerSentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Remap legacy hash favorites → Android-compatible ids for Mobile/TV sync.
  useEffect(() => {
    if (status !== "ready" || !payload?.channels?.length || favorites.length === 0) return;
    const remapped = remapFavoriteChannelIds(favorites, payload.channels);
    if (!remapped) return;
    setAll(remapped);
    dirtyRef.current = true;
    pushFavorites(remapped);
  }, [status, payload, favorites, setAll, pushFavorites]);

  // IPTV watch time → megacompanion_channel_watch (batch, Free Tier)
  useEffect(() => {
    setChannelWatchProfile(profileId);
  }, [profileId]);

  useEffect(() => {
    if (selected) {
      onIptvChannelChanged({ id: selected.id, name: selected.name, logo: selected.logo });
    } else {
      onIptvChannelPausedOrLeft();
    }
    return () => onIptvChannelPausedOrLeft();
  }, [selected]);

  useEffect(() => {
    const flushWatch = () => {
      onIptvChannelPausedOrLeft();
      flushIptvChannelWatchNow();
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flushWatch();
    };
    window.addEventListener("pagehide", flushWatch);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flushWatch);
      document.removeEventListener("visibilitychange", onVis);
      flushWatch();
    };
  }, []);

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
      // Auto-land on Favorites if matching favorites exist, else on "all"
      const favIds = new Set(favoritesRef.current);
      const hasMatchingFav = (data.channels || []).some((c) => {
        if (favIds.has(c.id) || (c.legacyId && favIds.has(c.legacyId))) return true;
        const colon = c.id.indexOf(":");
        if (colon > 0) {
          const bare = c.id.slice(colon + 1);
          return Array.from(favIds).some((f) => f.endsWith(bare));
        }
        return false;
      });
      if (data.configured && hasMatchingFav) {
        setActiveCat("fav");
      } else if (data.configured && (data.channels || []).length > 0) {
        setActiveCat("all");
      }
    },
    [profileId]
  );

  // Auto-select channel from URL if navigated with ?channel=...
  useEffect(() => {
    if (!urlChannelId || !payload?.channels?.length || selected) return;
    const target = payload.channels.find(
      (c) => c.id === urlChannelId || c.legacyId === urlChannelId
    );
    if (target) {
      setSelected(target);
      if (activeCat === "fav" && !favorites.includes(target.id) && !(target.legacyId && favorites.includes(target.legacyId))) {
        setActiveCat("all");
      }
    }
  }, [urlChannelId, payload, selected, activeCat, favorites]);

  // PiP IntersectionObserver: detaches player to bottom-right floating dock when user scrolls down
  useEffect(() => {
    if (!selected) {
      setIsPiP(false);
      return;
    }

    const sentinel = playerSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setIsPiP(true);
        } else if (entry.isIntersecting) {
          setIsPiP(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [selected]);

  // Quick search keyboard shortcut (/ or Ctrl+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearch("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ---- Channel load (localStorage-first, then network, with force reload) ---
  const fetchChannels = useCallback(
    async (forceNetwork = false) => {
      if (!forceNetwork) {
        const cached = readCache<ChannelsPayload>(channelsCacheKey(profileId), CHANNELS_CACHE_TTL);
        if (cached && cached.channels && cached.channels.length > 0) {
          applyPayload(cached);
          return;
        }
      } else {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(channelsCacheKey(profileId));
          window.localStorage.removeItem(`megatv_web_iptv_cache_v2_${profileId}`);
        }
      }
      setIsRefreshing(true);
      try {
        const res = await fetch(`/api/web/iptv/channels?profile=${encodeURIComponent(profileId)}&_t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ChannelsPayload;
        applyPayload(data);
        if (data.configured && data.channels && data.channels.length > 0 && (!data.errors || data.errors.length === 0)) {
          writeCache(channelsCacheKey(profileId), data);
        }
      } catch {
        setErrorMsg("Impossible de charger les chaînes.");
        setStatus("error");
      } finally {
        setIsRefreshing(false);
      }
    },
    [profileId, applyPayload]
  );

  useEffect(() => {
    void fetchChannels(false);
  }, [fetchChannels]);

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
    payload?.channels.forEach((c) => {
      map.set(c.id, c);
      if (c.legacyId) map.set(c.legacyId, c);
      const colon = c.id.indexOf(":");
      if (colon > 0) {
        const bare = c.id.slice(colon + 1);
        if (!map.has(bare)) map.set(bare, c);
      }
    });
    return map;
  }, [payload]);

  const hiddenCategorySet = useMemo(
    () => new Set(payload?.hiddenCategories ?? []),
    [payload?.hiddenCategories]
  );
  const hiddenChannelSet = useMemo(
    () => new Set(payload?.hiddenChannels ?? []),
    [payload?.hiddenChannels]
  );

  const categories = useMemo(() => {
    const visibleGroups = (payload?.categories ?? []).filter((c) => !hiddenCategorySet.has(c.label));
    const visibleTotal = (payload?.channels ?? []).filter(
      (c) =>
        !hiddenChannelSet.has(c.id) &&
        !(c.legacyId && hiddenChannelSet.has(c.legacyId)) &&
        !hiddenCategorySet.has(c.group)
    ).length;
    const base: IptvCategory[] = [
      { id: "fav", label: "Favoris", count: favorites.length },
      { id: "all", label: "Toutes les chaînes", count: visibleTotal }
    ];
    return [...base, ...visibleGroups];
  }, [favorites.length, payload, hiddenCategorySet, hiddenChannelSet]);

  const filtered = useMemo(() => {
    if (!payload) return [] as IptvChannel[];
    let list: IptvChannel[];
    if (activeCat === "fav") {
      list = favorites
        .map((id) => {
          if (channelById.has(id)) return channelById.get(id);
          const colon = id.indexOf(":");
          if (colon > 0) {
            const bare = id.slice(colon + 1);
            return channelById.get(bare);
          }
          return undefined;
        })
        .filter((c): c is IptvChannel => Boolean(c));
    } else if (activeCat === "all") {
      list = payload.channels;
    } else {
      const label = activeCat.startsWith("grp:") ? activeCat.slice(4) : activeCat;
      list = payload.channels.filter((c) => c.group === label);
    }
    if (activeCat !== "fav") {
      list = list.filter((c) => !hiddenCategorySet.has(c.group));
    }
    list = list.filter((c) => !hiddenChannelSet.has(c.id) && !(c.legacyId && hiddenChannelSet.has(c.legacyId)));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
    return list;
  }, [payload, activeCat, favorites, channelById, search, hiddenCategorySet, hiddenChannelSet]);

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
  const isFavorite = useCallback(
    (ch: IptvChannel) => favoriteSet.has(ch.id) || (ch.legacyId ? favoriteSet.has(ch.legacyId) : false),
    [favoriteSet]
  );

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
            <>
              {/* Sentinel to observe scroll position */}
              <div ref={playerSentinelRef} className="h-0 w-full pointer-events-none" />

              {/* In-flow placeholder when detached to PiP so scroll height is preserved */}
              {isPiP ? (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/25 p-4 text-center">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-[var(--mega-accent)]" />
                    <span className="text-sm font-bold text-white">{selected.name}</span>
                    <span className="rounded bg-[var(--mega-red)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      LIVE
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--mega-text-faint)]">
                    En cours de lecture dans le mini-lecteur PiP en bas à droite
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setIsPiP(false);
                    }}
                    className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" /> Agrandir le lecteur
                  </button>
                </div>
              ) : null}

              {/* The Persistent Player Container (Docked or PiP) */}
              <div
                className={clsx(
                  "transition-all duration-300 ease-out",
                  isPiP
                    ? "fixed bottom-6 right-6 z-50 w-80 sm:w-96 overflow-hidden rounded-2xl border border-[var(--mega-border-strong)] bg-black/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4"
                    : "relative w-full"
                )}
              >
                <TvLivePlayer
                  key={selected.id}
                  channel={selected}
                  subtitle={formatSlot(selected.tvgId ? epg[selected.tvgId]?.now : null) || selected.group}
                  isPiP={isPiP}
                  onClose={() => {
                    setSelected(null);
                    setIsPiP(false);
                  }}
                  onTogglePiP={() => setIsPiP((v) => !v)}
                  onExpand={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setIsPiP(false);
                  }}
                />
              </div>
            </>
          ) : null}

          {payload.capped ? (
            <p className="rounded-xl border border-[var(--mega-yellow)]/30 bg-[var(--mega-yellow)]/10 px-3 py-2 text-xs text-[var(--mega-yellow)]">
              Liste volumineuse tronquée pour la fluidité — affinez avec la recherche ou les catégories.
            </p>
          ) : null}
          {payload.errors.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--mega-red)]/30 bg-[var(--mega-red)]/10 px-3 py-2 text-xs text-[var(--mega-red)]">
              <span>{payload.errors.map((e) => `${e.name || "Liste"} : ${e.message}`).join(" · ")}</span>
              <button
                type="button"
                onClick={() => void fetchChannels(true)}
                disabled={isRefreshing}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-[var(--mega-red)]/20 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[var(--mega-red)]/30"
              >
                <RefreshCw className={clsx("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                Actualiser
              </button>
            </div>
          ) : null}

          {/* Enhanced Quick Search Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mega-text-faint)]" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Recherche rapide de chaînes… (raccourci : /)"
                className="focus-ring h-11 w-full rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] pl-10 pr-24 text-sm text-[var(--mega-text)] outline-none transition placeholder:text-[var(--mega-text-faint)] focus:border-[var(--mega-border-strong)]"
                aria-label="Recherche rapide de chaînes"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {search ? (
                  <>
                    <span className="hidden text-[11px] tabular-nums text-[var(--mega-text-faint)] sm:inline">
                      {filtered.length} chaîne{filtered.length > 1 ? "s" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSearchChange("")}
                      className="grid h-5 w-5 place-items-center rounded-full text-[var(--mega-text-faint)] hover:text-white"
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-[var(--mega-text-faint)] sm:inline-block">
                    /
                  </kbd>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void fetchChannels(true)}
              disabled={isRefreshing}
              className="focus-ring flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-3 text-xs font-semibold text-[var(--mega-text-muted)] transition hover:border-[var(--mega-border-strong)] hover:text-white"
              title="Actualiser la liste des chaînes"
            >
              <RefreshCw className={clsx("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
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
              message={
                isFav
                  ? payload?.channels?.length
                    ? "Aucun de vos favoris n'est présent dans cette playlist active. Découvrez toutes les chaînes disponibles."
                    : "Marquez des chaînes avec l'étoile pour les retrouver ici."
                  : "Aucune chaîne dans cette catégorie."
              }
              cta={
                isFav && payload?.channels?.length
                  ? { label: "Voir toutes les chaînes", onClick: () => selectCategory("all") }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((channel, index) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  nowNext={channel.tvgId ? epg[channel.tvgId] : undefined}
                  isFavorite={isFavorite(channel)}
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
        <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--mega-input-bg)] p-1">
          <IptvChannelLogo src={channel.logo} />
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
  cta?: { href?: string; label: string; onClick?: () => void };
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
        cta.onClick ? (
          <button
            type="button"
            onClick={cta.onClick}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-card-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--mega-text)] transition hover:bg-[var(--mega-surface-raised)]"
          >
            {cta.label}
          </button>
        ) : cta.href ? (
          <Link
            href={cta.href}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--mega-border-strong)] bg-[var(--mega-card-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--mega-text)] transition hover:bg-[var(--mega-surface-raised)]"
          >
            {cta.label}
          </Link>
        ) : null
      ) : null}
    </div>
  );
}
