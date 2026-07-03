"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Play, Server } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Modal } from "@/features/web/details/Modal";
import { Spinner } from "@/features/web/Spinner";
import { withProfileQuery } from "@/lib/companion/profile-scope";
import type { WebSource } from "@/app/api/web/sources/route";

type Props = {
  open: boolean;
  onClose: () => void;
  mediaId: string;
  profileId: string;
};

type State =
  | { status: "idle" | "loading" }
  | { status: "ready"; sources: WebSource[]; reason: string }
  | { status: "error" };

const REASON_HINT: Record<string, string> = {
  "no-addons": "Aucune source IPTV ou addon configurée. Ajoutez une playlist Xtream ou un addon Stremio depuis MegaCompagnon.",
  "no-imdb": "Identifiant IMDb introuvable pour ce titre — les addons ne peuvent pas le résoudre.",
  "no-streams": "Aucun flux lisible trouvé (torrents exclus en navigateur)."
};

const cache = new Map<string, { sources: WebSource[]; reason: string }>();

export function SourcePicker({ open, onClose, mediaId, profileId }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!open) return;
    let active = true;
    const load = async () => {
      const cached = cache.get(mediaId);
      if (cached) {
        if (active) setState({ status: "ready", sources: cached.sources, reason: cached.reason });
        return;
      }
      if (active) setState({ status: "loading" });
      try {
        const res = await fetch(
          `/api/web/sources?mediaId=${encodeURIComponent(mediaId)}&profile=${encodeURIComponent(profileId)}`
        );
        if (!res.ok) throw new Error("http");
        const data = (await res.json()) as { sources?: WebSource[]; reason?: string };
        if (!active) return;
        const sources = data.sources || [];
        const reason = data.reason || "ok";
        cache.set(mediaId, { sources, reason });
        setState({ status: "ready", sources, reason });
      } catch {
        if (active) setState({ status: "error" });
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [open, mediaId, profileId]);

  const launch = useCallback(
    (src?: string) => {
      const base = `/web/player/${mediaId}${src ? `?src=${encodeURIComponent(src)}` : ""}`;
      onClose();
      router.push(withProfileQuery(base, profileId));
    },
    [mediaId, profileId, router, onClose]
  );

  const ready = state.status === "ready" ? state : null;
  const hasSources = ready ? ready.sources.length > 0 : false;

  const groups = useMemo(() => {
    if (!ready?.sources.length) return [] as Array<{ label: string; sources: WebSource[] }>;
    const map = new Map<string, WebSource[]>();
    for (const source of ready.sources) {
      const key = source.groupLabel || "Sources";
      const bucket = map.get(key);
      if (bucket) bucket.push(source);
      else map.set(key, [source]);
    }
    return [...map.entries()].map(([label, sources]) => ({ label, sources }));
  }, [ready]);

  return (
    <Modal open={open} onClose={onClose} label="Choisir une source" size="sm">
      <div className="p-5 pt-6">
        <div className="mb-4 flex items-center gap-2 pr-8">
          <Server className="h-5 w-5 text-[var(--mega-text-muted)]" />
          <h2 className="text-lg font-bold text-[var(--mega-text)]">Sources</h2>
        </div>

        {state.status === "loading" || state.status === "idle" ? (
          <div className="grid place-items-center py-10">
            <Spinner size="md" />
          </div>
        ) : null}

        {state.status === "error" ? (
          <p className="py-6 text-center text-sm text-[var(--mega-text-muted)]">
            Impossible de charger les sources pour le moment.
          </p>
        ) : null}

        {ready ? (
          <div className="space-y-4">
            {hasSources ? (
              groups.map((group) => (
                <section key={group.label} className="space-y-2">
                  <h3 className="px-1 text-xs font-bold uppercase tracking-wide text-[var(--mega-text-faint)]">
                    {group.label}
                  </h3>
                  {group.sources.map((source, index) => (
                    <button
                      key={`${source.url}-${index}`}
                      type="button"
                      onClick={() => launch(source.url)}
                      className="focus-ring flex w-full items-center gap-3 rounded-xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3.5 py-3 text-left transition hover:border-[var(--mega-border-strong)] hover:bg-[var(--mega-surface)]"
                    >
                      <span
                        className={clsx(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold",
                          source.type === "hls"
                            ? "bg-[var(--mega-red)]/15 text-[var(--mega-red)]"
                            : "bg-[var(--mega-border)] text-[var(--mega-text-muted)]"
                        )}
                      >
                        {source.quality || source.type.toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[var(--mega-text)]">{source.title}</span>
                        <span className="block truncate text-[11px] text-[var(--mega-text-faint)]">
                          {[source.quality, source.detail].filter(Boolean).join(" · ") || group.label}
                        </span>
                      </span>
                      <Play className="h-4 w-4 shrink-0 text-[var(--mega-text-muted)]" fill="currentColor" />
                    </button>
                  ))}
                </section>
              ))
            ) : (
              <p className="pb-3 text-sm text-[var(--mega-text-muted)]">
                {REASON_HINT[ready.reason] || "Aucune source spécifique disponible."}
              </p>
            )}

            <button
              type="button"
              onClick={() => launch()}
              className="focus-ring mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--mega-text)] px-3.5 py-3 text-sm font-bold text-[var(--mega-background-deep)] transition hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Lecture par défaut
            </button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
