"use client";

import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
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
  const sheetItems = useMemo(() => toSheetItems(sources), [sources]);

  if (sources.length === 0) {
    const message =
      emptyReason === "no-addons"
        ? { title: "Aucun addon de sources configuré", hint: "Ajoutez un addon Stremio depuis MegaCompagnon." }
        : emptyReason === "no-imdb"
          ? { title: "Identifiant IMDb introuvable", hint: "Les addons Stremio ne peuvent pas résoudre ce titre." }
          : { title: "Aucune source disponible", hint: "Aucun flux lisible en navigateur." };

    return (
      <div className="grid h-screen w-screen place-items-center bg-black p-6 text-center">
        <div className="max-w-md space-y-4">
          <p className="text-xl font-bold text-white">{message.title}</p>
          <p className="text-sm text-white/60">{message.hint}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const stream = sources[Math.min(selected, sources.length - 1)];

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
        topRightSlot={
          sources.length > 1 ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60"
            >
              <Layers className="h-4 w-4" />
              {sources.length} sources
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
