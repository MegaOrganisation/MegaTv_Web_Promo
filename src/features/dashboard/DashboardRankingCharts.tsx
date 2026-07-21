"use client";

import { useEffect, useMemo, useState } from "react";
import { Clapperboard, Star, Tv } from "lucide-react";

import { CinemaGlassTile } from "@/components/ui/CinemaGlassTile";
import { CompanionActorDetailModal } from "@/features/companion/ui/CompanionActorDetailModal";
import { useMediaDetailOptional } from "@/features/companion/ui/MediaDetailContext";
import { MediaRankingChart, type MediaRankingItem } from "@/features/dashboard/MediaRankingChart";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";
import type { TopContentRow } from "@/lib/supabase/types";
import type { TopActorRow } from "@/lib/dashboard/buildTopActorsByWatchTime";
import type { ChannelWatchRow } from "@/lib/dashboard/channel-watch";
import { iptvLogoProxyUrl } from "@/lib/web/iptv-logo";

type TopProps = {
  items: TopContentRow[];
};

export function TopContentRankingChart({ items }: TopProps) {
  const ranking = useMemo<MediaRankingItem[]>(
    () =>
      items.map((row) => ({
        id: `${row.media_type}:${row.tmdb_id}`,
        label: row.title || `TMDB ${row.tmdb_id}`,
        watchSeconds: Math.max(0, Number(row.watch_seconds) || 0),
        imageUrl: tmdbProxiedImageUrl(row.poster_path, "w185"),
        imageKind: "poster" as const,
        subtitle: row.media_type === "tv" ? "Série" : "Film"
      })),
    [items]
  );

  return (
    <CinemaGlassTile index={5} className="dashboard-panel-full dashboard-panel-pad overflow-visible">
      <div className="mb-2 flex items-center gap-2">
        <Clapperboard className="h-5 w-5 text-[var(--mega-text-muted)]" />
        <div>
          <h2 className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">Top contenus</h2>
          <p className="text-sm text-[var(--mega-text-muted)]">Temps cumulé · clic pour le détail</p>
        </div>
      </div>
      <TopContentChartWithClick items={ranking} />
    </CinemaGlassTile>
  );
}

function TopContentChartWithClick({ items }: { items: MediaRankingItem[] }) {
  const media = useMediaDetailOptional();
  return (
    <MediaRankingChart
      items={items}
      emptyLabel="Aucun top contenu pour le moment."
      variant="bars-h"
      onItemClick={(item) => {
        const [type, idRaw] = String(item.id).split(":");
        const tmdbId = Number(idRaw);
        if ((type !== "movie" && type !== "tv") || !Number.isFinite(tmdbId) || tmdbId <= 0) return;
        media?.openMediaDetail({
          mediaType: type,
          tmdbId,
          title: item.label,
          posterUrl: item.imageUrl,
          meta: item.subtitle,
          layoutId: `top-${type}-${tmdbId}`
        });
      }}
    />
  );
}

type ActorProps = {
  profileId: string | null;
  /** Top contenus déjà calculés — seed pour forcer le classement acteurs */
  seedTitles?: TopContentRow[];
  initial?: TopActorRow[];
};

export function TopActorsRankingChart({ profileId, seedTitles = [], initial = [] }: ActorProps) {
  const [actors, setActors] = useState<TopActorRow[]>(initial);
  const [loading, setLoading] = useState(initial.length === 0);
  const [selectedActor, setSelectedActor] = useState<{ id: number; name: string } | null>(null);

  const seedKey = useMemo(
    () => seedTitles.map((t) => `${t.media_type}:${t.tmdb_id}:${t.watch_seconds}`).join("|"),
    [seedTitles]
  );

  useEffect(() => {
    let cancelled = false;
    const qs = profileId ? `?profile=${encodeURIComponent(profileId)}` : "";
    setLoading(true);
    const seed = seedTitles.slice(0, 12).map((t) => ({
      media_type: t.media_type,
      tmdb_id: t.tmdb_id,
      season: t.season,
      episode: t.episode,
      title: t.title,
      episode_title: t.episode_title,
      poster_path: t.poster_path,
      backdrop_path: t.backdrop_path,
      watch_seconds: Math.max(60, Number(t.watch_seconds) || 60),
      progress: t.progress,
      last_watched_at: t.last_watched_at
    }));

    async function loadFromEnrichFallback(): Promise<TopActorRow[]> {
      const titles = seed.filter((t) => Number(t.tmdb_id) > 0).slice(0, 10);
      if (titles.length === 0) return [];

      const byActor = new Map<
        number,
        { name: string; profilePath: string | null; watchSeconds: number; titles: Set<string>; imageUrl: string | null }
      >();

      await Promise.all(
        titles.map(async (title) => {
          try {
            const params = new URLSearchParams({
              media_type: title.media_type,
              tmdb_id: String(title.tmdb_id)
            });
            const r = await fetch(`/api/tmdb/enrich?${params.toString()}`);
            if (!r.ok) return;
            const json = (await r.json()) as {
              cast?: Array<{ id: number; name: string; photoUrl?: string | null }>;
            };
            const cast = (json.cast || []).slice(0, 8);
            const seconds = Math.max(60, Number(title.watch_seconds) || 60);
            for (const member of cast) {
              if (!member?.id || !member.name) continue;
              const prev = byActor.get(member.id);
              if (!prev) {
                byActor.set(member.id, {
                  name: member.name,
                  profilePath: null,
                  imageUrl: member.photoUrl || null,
                  watchSeconds: seconds,
                  titles: new Set(title.title ? [title.title] : [])
                });
              } else {
                prev.watchSeconds += seconds;
                if (!prev.imageUrl && member.photoUrl) prev.imageUrl = member.photoUrl;
                if (title.title) prev.titles.add(title.title);
              }
            }
          } catch {
            /* ignore titre */
          }
        })
      );

      return Array.from(byActor.entries())
        .map(([id, row]) => ({
          id,
          name: row.name,
          profilePath: row.profilePath,
          imageUrl: row.imageUrl,
          watchSeconds: row.watchSeconds,
          titles: Array.from(row.titles).slice(0, 4)
        }))
        .sort((a, b) => b.watchSeconds - a.watchSeconds)
        .slice(0, 8);
    }

    void (async () => {
      try {
        const r = await fetch(`/api/dashboard/top-actors${qs}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seed })
        });
        const json = r.ok ? await r.json() : null;
        let list = Array.isArray(json?.actors) ? (json.actors as TopActorRow[]) : [];
        if (list.length === 0 && seed.length > 0) {
          list = await loadFromEnrichFallback();
        }
        if (!cancelled) setActors(list);
      } catch {
        if (!cancelled) {
          const list = await loadFromEnrichFallback().catch(() => [] as TopActorRow[]);
          setActors(list);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // seedKey stabilise le refetch (évite boucle sur nouvelle ref tableau)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, seedKey]);

  const ranking = useMemo<MediaRankingItem[]>(
    () =>
      actors.map((a) => ({
        id: `actor:${a.id}`,
        label: a.name,
        watchSeconds: a.watchSeconds,
        imageUrl: a.imageUrl,
        imageKind: "avatar" as const,
        subtitle: a.titles?.slice(0, 2).join(" · ") || null
      })),
    [actors]
  );

  return (
    <CinemaGlassTile index={6} className="dashboard-panel-full dashboard-panel-pad overflow-visible">
      <div className="mb-2 flex items-center gap-2">
        <Star className="h-5 w-5 text-[var(--brand-gold)]" />
        <div>
          <h2 className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">Acteurs préférés</h2>
          <p className="text-sm text-[var(--mega-text-muted)]">Cumul multi-films / séries · clic pour la fiche</p>
        </div>
      </div>
      {loading && ranking.length === 0 ? (
        <p className="text-sm text-[var(--mega-text-faint)]">Calcul des acteurs…</p>
      ) : (
        <MediaRankingChart
          items={ranking}
          emptyLabel="Pas encore assez d’historique pour classer les acteurs."
          variant="area"
          onItemClick={(item) => {
            const id = Number(String(item.id).replace(/^actor:/, ""));
            if (!Number.isFinite(id) || id <= 0) return;
            setSelectedActor({ id, name: item.label });
          }}
        />
      )}
      <CompanionActorDetailModal
        personId={selectedActor?.id ?? null}
        fallbackName={selectedActor?.name || "Acteur"}
        onClose={() => setSelectedActor(null)}
      />
    </CinemaGlassTile>
  );
}

type ChannelProps = {
  profileId: string | null;
  initial?: ChannelWatchRow[];
};

export function TopChannelsRankingChart({ profileId, initial = [] }: ChannelProps) {
  const [channels, setChannels] = useState<ChannelWatchRow[]>(initial);
  const [loading, setLoading] = useState(initial.length === 0);

  useEffect(() => {
    let cancelled = false;
    const qs = profileId ? `?profile=${encodeURIComponent(profileId)}` : "";
    setLoading(true);
    void fetch(`/api/dashboard/top-channels${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const list = Array.isArray(json?.channels) ? (json.channels as ChannelWatchRow[]) : [];
        setChannels(list);
      })
      .catch(() => {
        if (!cancelled) setChannels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const ranking = useMemo<MediaRankingItem[]>(
    () =>
      channels
        .filter((c) => {
          const name = (c.channel_name || "").trim();
          if (!name) return false;
          // Jamais d’ID hash type 1gpu1x8 en label
          if (/^[a-z0-9]{5,14}$/i.test(name) && !/\s/.test(name)) return false;
          if (name === c.channel_id) return false;
          return true;
        })
        .map((c) => ({
          id: `ch:${c.channel_id}`,
          label: c.channel_name || "Chaîne",
          watchSeconds: Math.max(0, Number(c.watch_seconds) || 0),
          imageUrl: iptvLogoProxyUrl(c.logo_url),
          imageKind: "logo" as const,
          subtitle: "Chaîne IPTV"
        })),
    [channels]
  );

  return (
    <CinemaGlassTile id="activity" index={7} className="dashboard-panel-full dashboard-panel-pad overflow-visible">
      <div className="mb-2 flex items-center gap-2">
        <Tv className="h-5 w-5 text-[var(--brand-teal)]" />
        <div>
          <h2 className="text-lg font-bold text-[var(--mega-text)] sm:text-xl">Chaînes les plus vues</h2>
          <p className="text-sm text-[var(--mega-text-muted)]">Temps live · logos IPTV</p>
        </div>
      </div>
      {loading && ranking.length === 0 ? (
        <p className="text-sm text-[var(--mega-text-faint)]">Chargement des chaînes…</p>
      ) : (
        <MediaRankingChart
          items={ranking}
          emptyLabel="Aucune chaîne suivie pour l’instant. Les favoris IPTV apparaissent ici en attendant le live Android."
          variant="bars-v"
        />
      )}
    </CinemaGlassTile>
  );
}
