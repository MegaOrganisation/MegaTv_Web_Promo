"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";
import { useMemo, useState } from "react";

import { SourceSheet, type SourceSheetItem } from "@/features/web/details/SourceSheet";
import { WebPlayer, type PlayerSubtitle, type PlayerTrackMeta } from "@/features/web/WebPlayer";
import type { ResolvedStream } from "@/lib/web/stream-resolver";

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
  const [selected, setSelected] = useState(0);
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
    if (selected + 1 < sources.length) {
      setExhausted(false);
      setSelected((current) => current + 1);
      return;
    }
    setExhausted(true);
  };

  if (exhausted) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-black p-6 text-center">
        <div className="max-w-lg space-y-4">
          <p className="text-xl font-bold text-white">Aucune de ces sources n’est lisible dans le navigateur</p>
          <p className="text-sm leading-relaxed text-white/60">
            Les liens AllDebrid / Debrid testés sont probablement en conteneur MKV (ou codec incompatible HTML5).
            L’app Android les lit via ExoPlayer ; Chrome/Safari exigent du <span className="text-white/80">MP4</span> ou{" "}
            <span className="text-white/80">HLS</span>.
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
        onPlaybackFailed={tryNextOrExhaust}
        topRightSlot={
          sources.length > 1 ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60"
            >
              <Layers className="h-4 w-4" />
              {sources.length} sources · #{selected + 1}
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
