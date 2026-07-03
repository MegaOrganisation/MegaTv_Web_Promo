"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ArrowLeft, Check, Layers } from "lucide-react";
import { useState } from "react";

import { WebPlayer, type PlayerSubtitle, type PlayerTrackMeta } from "@/features/web/WebPlayer";
import type { ResolvedStream } from "@/lib/web/stream-resolver";

type Props = {
  sources: ResolvedStream[];
  subtitles: PlayerSubtitle[];
  title: string;
  backHref: string;
  resumeKey: string;
  track: PlayerTrackMeta | null;
  /** Shown when no source could be resolved. */
  emptyReason?: "no-addons" | "no-imdb" | "no-streams" | null;
  addonsHref: string;
};

function emptyMessage(reason: Props["emptyReason"]): { title: string; hint: string } {
  switch (reason) {
    case "no-addons":
      return {
        title: "Aucun addon de sources configuré",
        hint: "Ajoutez un addon Stremio depuis MegaCompagnon pour débloquer la lecture."
      };
    case "no-imdb":
      return {
        title: "Identifiant IMDb introuvable",
        hint: "Ce titre n'a pas d'IMDb id — les addons Stremio ne peuvent pas le résoudre."
      };
    default:
      return {
        title: "Aucune source disponible",
        hint: "Les addons n'ont renvoyé aucun flux lisible en navigateur (les torrents ne sont pas supportés)."
      };
  }
}

export function WebPlayerExperience({
  sources,
  subtitles,
  title,
  backHref,
  resumeKey,
  track,
  emptyReason,
  addonsHref
}: Props) {
  const [selected, setSelected] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (sources.length === 0) {
    const message = emptyMessage(emptyReason);
    return (
      <div className="grid h-screen w-screen place-items-center bg-black p-6 text-center">
        <div className="max-w-md space-y-4">
          <p className="text-xl font-bold text-white">{message.title}</p>
          <p className="text-sm text-white/60">{message.hint}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={backHref}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
            {emptyReason === "no-addons" ? (
              <Link
                href={addonsHref}
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black"
              >
                Configurer les addons
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const stream = sources[Math.min(selected, sources.length - 1)];

  const sourcesButton =
    sources.length > 1 ? (
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="focus-ring inline-flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60"
      >
        <Layers className="h-4 w-4" />
        {sources.length} sources
      </button>
    ) : null;

  return (
    <>
      <WebPlayer
        key={stream.url}
        stream={stream}
        title={title}
        backHref={backHref}
        resumeKey={resumeKey}
        subtitles={subtitles}
        track={track}
        topRightSlot={sourcesButton}
      />

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setPickerOpen(false)}>
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[var(--mega-surface)] p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-bold text-white">Choisir une source</h2>
            <div className="space-y-1.5">
              {sources.map((source, index) => (
                <button
                  key={source.url}
                  type="button"
                  onClick={() => {
                    setSelected(index);
                    setPickerOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                    index === selected
                      ? "border-[var(--mega-red)]/40 bg-[var(--mega-red)]/10"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {source.provider} · {source.quality || "?"}
                    </p>
                    <p className="truncate text-[11px] text-white/45">{source.label}</p>
                  </div>
                  {index === selected ? <Check className="h-4 w-4 shrink-0 text-[var(--mega-red)]" /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
