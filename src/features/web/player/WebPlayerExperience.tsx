"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";
import { useMemo, useState } from "react";

import { SourceSheet, type SourceSheetItem } from "@/features/web/details/SourceSheet";
import { WebPlayer, type PlayerSubtitle, type PlayerTrackMeta } from "@/features/web/WebPlayer";
import type { ResolvedStream } from "@/lib/web/stream-resolver";
import { encodeMediaId } from "@/lib/web/media";
import { withProfileQuery } from "@/lib/companion/profile-scope";

type Props = {
  sources: ResolvedStream[];
  subtitles: PlayerSubtitle[];
  title: string;
  logoUrl?: string | null;
  backHref: string;
  resumeKey: string;
  track: PlayerTrackMeta | null;
  emptyReason?: "no-addons" | "no-imdb" | "no-streams" | null;
  addonsHref: string;
};

function toSheetItems(sources: ResolvedStream[]): SourceSheetItem[] {
  return sources.map((source) => ({
    url: source.url,
    groupId: source.groupId || source.addonId || source.groupLabel || "addon",
    groupLabel: source.groupLabel || source.provider || "Addon",
    title: source.title || source.label,
    quality: source.quality || "",
    detail: source.detail || null,
    label: source.label,
    type: source.type
  }));
}

export function WebPlayerExperience({
  sources,
  subtitles,
  title,
  logoUrl,
  backHref,
  resumeKey,
  track,
  emptyReason,
  addonsHref
}: Props) {
  const router = useRouter();
  // Prefer ≤1080p for autoplay — 4K (often HEVC) frequently paints a black frame in Chrome.
  const initialIndex = useMemo(() => {
    const idx = sources.findIndex((s) => (s.resolution || 0) > 0 && (s.resolution || 0) <= 1080);
    return idx >= 0 ? idx : 0;
  }, [sources]);
  const [selected, setSelected] = useState(initialIndex);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const sheetItems = useMemo(() => toSheetItems(sources), [sources]);

  if (sources.length === 0) {
    const message =
      emptyReason === "no-addons"
        ? { title: "Aucun addon de sources configuré", hint: "Ajoutez un addon Stremio depuis MegaCompagnon." }
        : emptyReason === "no-imdb"
          ? { title: "Identifiant IMDb introuvable", hint: "Les addons Stremio ne peuvent pas résoudre ce titre." }
          : {
              title: "Aucune source lisible dans le navigateur",
              hint: "Les miroirs Debrid sont souvent en MKV (OK dans l’app Android, pas dans Chrome/Safari). Il faut un flux MP4 ou HLS — addon qui expose du HTTP web-ready, ou VOD Xtream."
            };

    return (
      <div className="grid h-screen w-screen place-items-center bg-black p-6 text-center">
        <div className="max-w-md space-y-4">
          <p className="text-xl font-bold text-white">{message.title}</p>
          <p className="text-sm text-white/60">{message.hint}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <a
              href={addonsHref}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Gérer les addons
            </a>
          </div>
        </div>
      </div>
    );
  }

  const stream = sources[Math.min(selected, sources.length - 1)];

  const tryNextOrExhaust = () => {
    let next = selected + 1;
    // Skip 4K on auto-advance (HEVC black screen); still available via picker.
    while (next < sources.length && (sources[next].resolution || 0) >= 2160) next += 1;
    if (next < sources.length) {
      setExhausted(false);
      setSelected(next);
      return;
    }
    setExhausted(true);
  };

  if (exhausted) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-black p-6 text-center">
        <div className="max-w-lg space-y-4">
          <p className="text-xl font-bold text-white">Lecture automatique impossible</p>
          <p className="text-sm leading-relaxed text-white/60">
            Aucune source n’a démarré toute seule. Choisissez-en une manuellement — le 1080p est en général plus fiable
            que le 4K (souvent HEVC = écran noir dans Chrome).
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {sources.length > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setExhausted(false);
                  setPickerOpen(true);
                }}
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Layers className="h-4 w-4" /> Choisir une source
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => router.back()}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <a
              href={addonsHref}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Addons
            </a>
          </div>
          <SourceSheet
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            title={title}
            logoUrl={logoUrl}
            sources={sheetItems}
            selectedUrl={stream.url}
            onSelect={(source) => {
              const index = sources.findIndex((item) => item.url === source.url);
              setSelected(index >= 0 ? index : 0);
              setExhausted(false);
              setPickerOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  const handleNextEpisode = () => {
    if (
      track?.mediaType === "tv" &&
      typeof track.season === "number" &&
      typeof track.episode === "number" &&
      track.profileId
    ) {
      const nextMediaId = encodeMediaId("tv", track.tmdbId, track.season, track.episode + 1);
      router.push(withProfileQuery(`/web/player/${nextMediaId}`, track.profileId));
    }
  };

  return (
    <>
      <WebPlayer
        key={`${stream.url}-${selected}`}
        stream={stream}
        title={title}
        backHref={backHref}
        resumeKey={resumeKey}
        subtitles={subtitles}
        track={track}
        logoUrl={logoUrl}
        onNextEpisode={handleNextEpisode}
        onPlaybackFailed={tryNextOrExhaust}
        topRightSlot={
          sources.length > 1 ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
            >
              <Layers className="h-3.5 w-3.5 text-[var(--mega-red)]" />
              <span>{sources.length} sources · #{selected + 1}</span>
            </button>
          ) : null
        }
      />

      <SourceSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={title}
        logoUrl={logoUrl}
        sources={sheetItems}
        selectedUrl={stream.url}
        onSelect={(source) => {
          const index = sources.findIndex((item) => item.url === source.url);
          setSelected(index >= 0 ? index : 0);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
