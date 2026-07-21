"use client";

import { clsx } from "clsx";
import {
  Eye,
  EyeOff,
  GripVertical,
  LayoutGrid,
  Loader2,
  Search,
  Sparkles,
  Star,
  Layers
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { IptvChannelLogo } from "@/features/web/tv/IptvChannelLogo";
import { seedFavoritesIfEmpty, useIptvFavorites } from "@/lib/web/iptv-favorites";
import { deduplicateChannels } from "@/lib/iptv/dedupe-channels";
import { remapFavoriteChannelIds, type IptvChannel, type IptvCategory } from "@/lib/web/iptv-channels";

type Tab = "channels" | "favorites" | "categories";
type ViewMode = "all" | "deduped";

type ChannelsPayload = {
  configured: boolean;
  channels: IptvChannel[];
  categories: IptvCategory[];
  favoriteChannels: string[];
  hiddenCategories?: string[];
  hiddenChannels?: string[];
  capped?: boolean;
  total?: number;
  error?: string;
};

const FAV_STAR = "#FFC04A";
const SAVE_DEBOUNCE_MS = 1800;

type Props = {
  profileId: string;
  initialFavorites: string[];
  initialHiddenCategories: string[];
  initialHiddenChannels: string[];
};

export function IptvChannelsManager({
  profileId,
  initialFavorites,
  initialHiddenCategories,
  initialHiddenChannels
}: Props) {
  const { favorites, toggle, reorder, setAll } = useIptvFavorites(profileId);
  const [tab, setTab] = useState<Tab>("channels");
  const [viewMode, setViewMode] = useState<ViewMode>("deduped");
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [channels, setChannels] = useState<IptvChannel[]>([]);
  const [categories, setCategories] = useState<IptvCategory[]>([]);
  const [hidden, setHidden] = useState<string[]>(initialHiddenCategories);
  const [hiddenChannelIds, setHiddenChannelIds] = useState<string[]>(initialHiddenChannels);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capped, setCapped] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [savingFav, setSavingFav] = useState(false);
  const [savingHidden, setSavingHidden] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const favDirty = useRef(false);
  const hiddenDirty = useRef(false);
  const hiddenChannelsDirty = useRef(false);
  const favoritesRef = useRef(favorites);
  const hiddenRef = useRef(hidden);
  const hiddenChannelsRef = useRef(hiddenChannelIds);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);
  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);
  useEffect(() => {
    hiddenChannelsRef.current = hiddenChannelIds;
  }, [hiddenChannelIds]);

  useEffect(() => {
    seedFavoritesIfEmpty(profileId, initialFavorites);
    if (favorites.length === 0 && initialFavorites.length > 0) {
      setAll(initialFavorites);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once on mount / profile
  }, [profileId]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    void fetch(`/api/web/iptv/channels?profile=${encodeURIComponent(profileId)}`)
      .then(async (r) => {
        const json = (await r.json()) as ChannelsPayload;
        if (cancelled) return;
        if (!r.ok || json.error) {
          setStatus("error");
          setErrorMsg(json.error || "Chargement impossible");
          return;
        }
        if (!json.configured || !json.channels?.length) {
          setStatus("empty");
          setChannels([]);
          setCategories([]);
          return;
        }
        setChannels(json.channels);
        setCategories(json.categories || []);
        setCapped(Boolean(json.capped));
        if (json.favoriteChannels?.length) seedFavoritesIfEmpty(profileId, json.favoriteChannels);
        if (Array.isArray(json.hiddenCategories)) setHidden(json.hiddenCategories);
        if (Array.isArray(json.hiddenChannels)) setHiddenChannelIds(json.hiddenChannels);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg("Réseau indisponible");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const pushFavorites = useCallback(
    async (ids: string[]) => {
      setSavingFav(true);
      try {
        const res = await fetch("/api/web/iptv/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: profileId, favoriteChannels: ids }),
          keepalive: true
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          setToast(body?.error || "Échec sync favoris");
        } else {
          setToast("Favoris synchronisés");
          favDirty.current = false;
        }
      } catch {
        setToast("Échec sync favoris");
      } finally {
        setSavingFav(false);
      }
    },
    [profileId]
  );

  const pushHidden = useCallback(
    async (labels: string[]) => {
      setSavingHidden(true);
      try {
        const res = await fetch("/api/companion/iptv/hidden-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, hiddenCategories: labels }),
          keepalive: true
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          setToast(body?.error || "Échec sync catégories");
        } else {
          setToast("Catégories synchronisées");
          hiddenDirty.current = false;
        }
      } catch {
        setToast("Échec sync catégories");
      } finally {
        setSavingHidden(false);
      }
    },
    [profileId]
  );

  const pushHiddenChannels = useCallback(
    async (ids: string[]) => {
      setSavingHidden(true);
      try {
        const res = await fetch("/api/companion/iptv/hidden-channels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, hiddenChannels: ids }),
          keepalive: true
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          setToast(body?.error || "Échec sync chaînes masquées");
        } else {
          setToast("Chaînes masquées synchronisées");
          hiddenChannelsDirty.current = false;
        }
      } catch {
        setToast("Échec sync chaînes masquées");
      } finally {
        setSavingHidden(false);
      }
    },
    [profileId]
  );

  const favoritesReconciled = useRef(false);
  useEffect(() => {
    favoritesReconciled.current = false;
  }, [profileId]);

  // Remap legacy web hashes → Android ids first; only then reconcile local → cloud.
  // Pushing hashes before channels load was wiping good cloud Android favorites.
  useEffect(() => {
    if (favoritesReconciled.current || !profileId || status !== "ready" || channels.length === 0) return;
    const source = favorites.length > 0 ? favorites : initialFavorites;
    if (source.length === 0) {
      favoritesReconciled.current = true;
      return;
    }
    const remapped = remapFavoriteChannelIds(source, channels);
    const next = remapped || source;
    const looksAndroid = next.some((id) => id.includes(":m3u:"));
    const cloud = initialFavorites;
    const same =
      next.length === cloud.length && next.every((id, index) => id === cloud[index]);
    favoritesReconciled.current = true;
    if (remapped) setAll(remapped);
    if (!same && (looksAndroid || next.length > cloud.length)) {
      favDirty.current = true;
      void pushFavorites(next);
      if (looksAndroid) setToast(`${next.length} favoris alignés pour Mobile/TV`);
    }
  }, [profileId, status, channels, favorites, initialFavorites, setAll, pushFavorites]);

  // Remap + reconcile handled above.

  useEffect(() => {
    if (!favDirty.current) return;
    const t = setTimeout(() => void pushFavorites(favoritesRef.current), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [favorites, pushFavorites]);

  useEffect(() => {
    if (!hiddenDirty.current) return;
    const t = setTimeout(() => void pushHidden(hiddenRef.current), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [hidden, pushHidden]);

  useEffect(() => {
    if (!hiddenChannelsDirty.current) return;
    const t = setTimeout(() => void pushHiddenChannels(hiddenChannelsRef.current), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [hiddenChannelIds, pushHiddenChannels]);

  useEffect(() => {
    const flush = () => {
      if (favDirty.current) void pushFavorites(favoritesRef.current);
      if (hiddenDirty.current) void pushHidden(hiddenRef.current);
      if (hiddenChannelsDirty.current) void pushHiddenChannels(hiddenChannelsRef.current);
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
      flush();
    };
  }, [pushFavorites, pushHidden, pushHiddenChannels]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);
  const hiddenChannelSet = useMemo(() => new Set(hiddenChannelIds), [hiddenChannelIds]);

  const isFavorite = useCallback(
    (ch: IptvChannel) => favoriteSet.has(ch.id) || (ch.legacyId ? favoriteSet.has(ch.legacyId) : false),
    [favoriteSet]
  );

  const baseChannels = useMemo(() => {
    const list = viewMode === "deduped" ? deduplicateChannels(channels) : channels;
    return list;
  }, [channels, viewMode]);

  const visibleChannels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseChannels.filter((ch) => {
      if (tab === "favorites" && !isFavorite(ch)) return false;
      if (tab === "channels" && activeGroup !== "all" && activeGroup !== "fav" && activeGroup !== "hidden") {
        if (ch.group !== activeGroup) return false;
      }
      if (tab === "channels" && activeGroup === "fav" && !isFavorite(ch)) return false;
      if (tab === "channels" && activeGroup === "hidden" && !hiddenChannelSet.has(ch.id) && !hiddenChannelSet.has(ch.legacyId)) {
        return false;
      }
      if (
        activeGroup !== "hidden" &&
        hiddenSet.has(ch.group) &&
        tab !== "favorites" &&
        activeGroup !== ch.group
      ) {
        return false;
      }
      if (!q) return true;
      return ch.name.toLowerCase().includes(q) || ch.group.toLowerCase().includes(q);
    });
  }, [baseChannels, search, tab, activeGroup, isFavorite, hiddenSet, hiddenChannelSet]);

  const orderedFavorites = useMemo(() => {
    const byId = new Map<string, IptvChannel>();
    for (const c of baseChannels) {
      byId.set(c.id, c);
      if (c.legacyId) byId.set(c.legacyId, c);
    }
    return favorites.map((id) => byId.get(id)).filter(Boolean) as IptvChannel[];
  }, [favorites, baseChannels]);

  const categoryRows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ch of baseChannels) {
      counts.set(ch.group, (counts.get(ch.group) || 0) + 1);
    }
    const labels = [...new Set([...categories.map((c) => c.label), ...counts.keys()])].sort((a, b) =>
      a.localeCompare(b, "fr")
    );
    return labels.map((label) => ({
      label,
      count: counts.get(label) || categories.find((c) => c.label === label)?.count || 0,
      hidden: hiddenSet.has(label)
    }));
  }, [baseChannels, categories, hiddenSet]);

  function onToggleFav(id: string) {
    favDirty.current = true;
    toggle(id);
  }

  function onToggleHidden(label: string) {
    hiddenDirty.current = true;
    setHidden((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  }

  function onToggleHiddenChannel(id: string) {
    hiddenChannelsDirty.current = true;
    setHiddenChannelIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function hideAllCategories() {
    hiddenDirty.current = true;
    setHidden(categoryRows.map((r) => r.label));
    setToast(`${categoryRows.length} catégories masquées`);
  }

  function showAllCategories() {
    hiddenDirty.current = true;
    setHidden([]);
    setToast("Toutes les catégories affichées");
  }

  function hideAllVisibleChannels() {
    const ids = visibleChannels.map((c) => c.id);
    if (ids.length === 0) return;
    hiddenChannelsDirty.current = true;
    setHiddenChannelIds((prev) => [...new Set([...prev, ...ids])]);
    setToast(`${ids.length} chaîne${ids.length > 1 ? "s" : ""} masquée${ids.length > 1 ? "s" : ""}`);
  }

  function showAllChannels() {
    hiddenChannelsDirty.current = true;
    setHiddenChannelIds([]);
    setToast("Toutes les chaînes affichées");
  }

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDropOn(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const next = [...favorites];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    favDirty.current = true;
    reorder(next);
    setDragId(null);
  }

  const stats = {
    total: channels.length,
    shown: baseChannels.length,
    fav: favorites.length,
    hidden: hidden.length,
    hiddenChannels: hiddenChannelIds.length,
    removed: Math.max(0, channels.length - (viewMode === "deduped" ? baseChannels.length : channels.length))
  };

  return (
    <GlassCard className="iptv-manage-hub overflow-visible">
      <div className="iptv-manage-stack">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="iptv-manage-header-kicker text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--mega-text-faint)]">
              Chaînes & catégories
            </p>
            <h2 className="iptv-manage-header-title text-xl font-black text-[var(--mega-text)]">Gestion IPTV live</h2>
            <p className="iptv-manage-header-sub max-w-xl text-sm leading-relaxed text-[var(--mega-text-muted)]">
              Favoris, masquage de catégories / chaînes et vue dédoublonnée — même logique que l’app MegaTv.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(savingFav || savingHidden) && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mega-border)] px-3 py-1.5 text-[11px] font-semibold text-[var(--mega-text-muted)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sync…
              </span>
            )}
            {toast ? (
              <span className="rounded-full border border-[var(--brand-gold)]/35 bg-[var(--brand-gold)]/12 px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-gold)]">
                {toast}
              </span>
            ) : null}
          </div>
        </header>

        <div className="iptv-manage-toolbar">
          <div className="flex flex-wrap gap-2.5">
            {(
              [
                { id: "channels" as const, label: "Chaînes", icon: LayoutGrid },
                { id: "favorites" as const, label: "Favoris", icon: Star },
                { id: "categories" as const, label: "Catégories", icon: Layers }
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={clsx(
                  "focus-ring inline-flex min-h-11 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-bold transition",
                  tab === item.id
                    ? "bg-[var(--brand-gold)] text-[#10191C] shadow-[0_10px_28px_-12px_rgba(242,180,60,0.65)]"
                    : "border border-[var(--mega-border)] text-[var(--mega-text-muted)] hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
                )}
              >
                <item.icon
                  className="h-4 w-4 shrink-0"
                  fill={item.id === "favorites" && tab === item.id ? "currentColor" : "none"}
                  strokeWidth={2}
                />
                <span>{item.label}</span>
                {item.id === "favorites" ? <span className="opacity-70">{stats.fav}</span> : null}
              </button>
            ))}
          </div>

          {tab !== "categories" ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[12rem] flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mega-text-faint)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une chaîne…"
                  className="focus-ring w-full rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] py-3 pl-11 pr-4 text-sm text-[var(--mega-text)] outline-none placeholder:text-[var(--mega-text-faint)]"
                />
              </div>
              <div className="inline-flex rounded-full border border-[var(--mega-border)] p-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode("all")}
                  className={clsx(
                    "rounded-full px-3.5 py-2 text-xs font-bold transition",
                    viewMode === "all" ? "bg-white/12 text-white" : "text-[var(--mega-text-muted)]"
                  )}
                >
                  Toutes ({stats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("deduped")}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition",
                    viewMode === "deduped" ? "bg-white/12 text-white" : "text-[var(--mega-text-muted)]"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Dédoublonnées ({stats.shown})
                </button>
              </div>
            </div>
          ) : null}

          {tab === "channels" ? (
            <div className="flex flex-wrap gap-2.5">
              <BulkHideButton
                label="Afficher tout"
                icon={Eye}
                tone="show"
                onClick={showAllChannels}
                disabled={stats.hiddenChannels === 0}
              />
              <BulkHideButton
                label="Masquer tout"
                icon={EyeOff}
                tone="hide"
                onClick={hideAllVisibleChannels}
                disabled={visibleChannels.length === 0}
                title="Masque les chaînes actuellement listées (filtre / recherche inclus)"
              />
            </div>
          ) : null}

          {tab === "categories" ? (
            <div className="flex flex-wrap gap-2.5">
              <BulkHideButton
                label="Afficher tout"
                icon={Eye}
                tone="show"
                onClick={showAllCategories}
                disabled={stats.hidden === 0}
              />
              <BulkHideButton
                label="Masquer tout"
                icon={EyeOff}
                tone="hide"
                onClick={hideAllCategories}
                disabled={categoryRows.length === 0}
              />
            </div>
          ) : null}

          {tab === "channels" && categoryRows.length > 0 ? (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              <Chip active={activeGroup === "all"} onClick={() => setActiveGroup("all")} label={`Tout · ${stats.shown}`} />
              <Chip
                active={activeGroup === "fav"}
                onClick={() => setActiveGroup("fav")}
                label={`Favoris · ${stats.fav}`}
                star
              />
              <Chip
                active={activeGroup === "hidden"}
                onClick={() => setActiveGroup("hidden")}
                label={`Masquées · ${stats.hiddenChannels}`}
                muted={stats.hiddenChannels === 0}
              />
              {categoryRows
                .filter((c) => !c.hidden || activeGroup === c.label)
                .slice(0, 40)
                .map((c) => (
                  <Chip
                    key={c.label}
                    active={activeGroup === c.label}
                    onClick={() => setActiveGroup(c.label)}
                    label={`${c.label} · ${c.count}`}
                    muted={c.hidden}
                  />
                ))}
            </div>
          ) : null}
        </div>

        {status === "loading" ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--mega-text-muted)]">
            <Loader2 className="h-5 w-5 animate-spin" /> Chargement des chaînes…
          </div>
        ) : null}
        {status === "error" ? <p className="py-6 text-center text-sm text-rose-300">{errorMsg}</p> : null}
        {status === "empty" ? (
          <p className="py-6 text-center text-sm text-[var(--mega-text-muted)]">
            Aucune chaîne — ajoutez une playlist M3U/Xtream ci-dessus.
          </p>
        ) : null}

        {status === "ready" && tab === "categories" ? (
          <ul className="iptv-manage-grid">
            {categoryRows.map((row) => (
              <li key={row.label}>
                <button
                  type="button"
                  onClick={() => onToggleHidden(row.label)}
                  className={clsx(
                    "iptv-cat-card focus-ring flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition",
                    row.hidden
                      ? "border-[var(--mega-border)] bg-black/25 opacity-70"
                      : "border-[var(--mega-border)] bg-[var(--mega-card-bg)] hover:border-[var(--brand-gold)]/40 hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)]"
                  )}
                >
                  <span
                    className={clsx(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/6",
                      row.hidden ? "text-[#F97316]" : "text-[#34D399]"
                    )}
                  >
                    {row.hidden ? (
                      <EyeOff className="h-4 w-4" strokeWidth={2.25} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={2.25} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 py-0.5">
                    <span className="block truncate text-sm font-bold text-[var(--mega-text)]">{row.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[var(--mega-text-faint)]">
                      {row.count} chaîne{row.count > 1 ? "s" : ""} · {row.hidden ? "Masquée" : "Visible"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {status === "ready" && tab === "favorites" ? (
          orderedFavorites.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--mega-text-muted)]">
              Aucun favori — cliquez l’étoile jaune sur une chaîne.
            </p>
          ) : (
            <ul className="iptv-manage-grid">
              {orderedFavorites.map((ch) => (
                <li
                  key={ch.id}
                  draggable
                  onDragStart={() => onDragStart(ch.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropOn(ch.id)}
                  className={clsx("iptv-ch-card", dragId === ch.id && "opacity-50")}
                >
                  <ChannelManageCard
                    channel={ch}
                    favorite
                    draggable
                    hidden={hiddenChannelSet.has(ch.id)}
                    onToggleFav={() => onToggleFav(ch.id)}
                    onToggleHidden={() => onToggleHiddenChannel(ch.id)}
                  />
                </li>
              ))}
            </ul>
          )
        ) : null}

        {status === "ready" && tab === "channels" ? (
          visibleChannels.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--mega-text-muted)]">Aucune chaîne pour ce filtre.</p>
          ) : (
            <ul className="iptv-manage-grid">
              {visibleChannels.slice(0, 240).map((ch) => (
                <li key={ch.id} className="iptv-ch-card">
                  <ChannelManageCard
                    channel={ch}
                    favorite={isFavorite(ch)}
                    hidden={hiddenChannelSet.has(ch.id)}
                    onToggleFav={() => onToggleFav(ch.id)}
                    onToggleHidden={() => onToggleHiddenChannel(ch.id)}
                  />
                </li>
              ))}
            </ul>
          )
        ) : null}

        {status === "ready" ? (
          <p className="text-[11px] leading-relaxed text-[var(--mega-text-faint)]">
            {viewMode === "deduped"
              ? `${stats.removed} doublon${stats.removed > 1 ? "s" : ""} fusionné${stats.removed > 1 ? "s" : ""} (qualité / variantes).`
              : "Vue brute — toutes les entrées M3U/Xtream."}
            {capped ? " Liste plafonnée côté serveur." : ""}
            {stats.hidden > 0
              ? ` · ${stats.hidden} catégorie${stats.hidden > 1 ? "s" : ""} masquée${stats.hidden > 1 ? "s" : ""}`
              : ""}
            {stats.hiddenChannels > 0
              ? ` · ${stats.hiddenChannels} chaîne${stats.hiddenChannels > 1 ? "s" : ""} masquée${stats.hiddenChannels > 1 ? "s" : ""}`
              : ""}
            {" · "}Sync cloud batch (favoris + masquages).
          </p>
        ) : null}
      </div>
    </GlassCard>
  );
}

function BulkHideButton({
  label,
  icon: Icon,
  tone,
  onClick,
  disabled,
  title
}: {
  label: string;
  icon: typeof Eye;
  tone: "show" | "hide";
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const iconColor = tone === "show" ? "text-[#34D399]" : "text-[#F97316]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "focus-ring inline-flex min-h-10 items-center gap-2.5 rounded-full border px-4 py-2.5 text-xs font-bold transition",
        disabled
          ? "cursor-not-allowed border-[var(--mega-border)] text-[var(--mega-text-faint)] opacity-50"
          : "border-[var(--mega-border)] text-[var(--mega-text-muted)] hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
      )}
    >
      <Icon className={clsx("h-3.5 w-3.5 shrink-0", !disabled && iconColor)} strokeWidth={2.25} />
      {label}
    </button>
  );
}

function Chip({
  label,
  active,
  onClick,
  star,
  muted
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  star?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "focus-ring shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition",
        active
          ? "bg-[var(--brand-gold)] text-[#10191C]"
          : muted
            ? "border border-dashed border-[var(--mega-border)] text-[var(--mega-text-faint)]"
            : "border border-[var(--mega-border)] text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
      )}
    >
      {star ? <Star className="mr-1 inline h-3 w-3" fill={active ? "currentColor" : "none"} /> : null}
      {label}
    </button>
  );
}

function ChannelManageCard({
  channel,
  favorite,
  hidden,
  draggable,
  onToggleFav,
  onToggleHidden
}: {
  channel: IptvChannel;
  favorite: boolean;
  hidden?: boolean;
  draggable?: boolean;
  onToggleFav: () => void;
  onToggleHidden: () => void;
}) {
  return (
    <article
      className={clsx(
        "group relative flex items-center gap-3.5 rounded-2xl border border-[var(--mega-border)] bg-[linear-gradient(155deg,rgba(22,28,34,0.95),rgba(10,12,16,0.9))] p-3.5 sm:p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.85)] transition duration-300 hover:border-[var(--brand-gold)]/35 hover:shadow-[0_22px_48px_-24px_rgba(242,180,60,0.28)]",
        hidden && "opacity-60"
      )}
    >
      {draggable ? (
        <span className="shrink-0 cursor-grab text-[var(--mega-text-faint)] active:cursor-grabbing" aria-hidden>
          <GripVertical className="h-4 w-4" />
        </span>
      ) : null}
      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/8 bg-white/6 p-1.5 shadow-inner">
        <IptvChannelLogo src={channel.logo} className="h-full w-full object-contain" fallback={<LayoutGrid className="h-5 w-5 text-[var(--mega-text-faint)]" />} />
      </span>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="truncate text-sm font-bold leading-snug text-[var(--mega-text)]">{channel.name}</p>
        <p className="mt-1 truncate text-[11px] leading-snug text-[var(--mega-text-faint)]">
          {channel.group}
          {hidden ? " · Masquée" : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleHidden}
        aria-label={hidden ? "Afficher la chaîne" : "Masquer la chaîne"}
        aria-pressed={hidden}
        className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/30 transition hover:bg-white/10"
      >
        {hidden ? (
          <EyeOff className="h-4 w-4 text-[#F97316]" strokeWidth={2.25} />
        ) : (
          <Eye className="h-4 w-4 text-[#34D399]" strokeWidth={2.25} />
        )}
      </button>
      <button
        type="button"
        onClick={onToggleFav}
        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={favorite}
        className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/30 transition hover:bg-white/10"
      >
        <Star
          className="h-4 w-4"
          color={favorite ? FAV_STAR : "#FFFFFF"}
          fill={favorite ? FAV_STAR : "transparent"}
          strokeWidth={favorite ? 0 : 2}
        />
      </button>
    </article>
  );
}
