"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { SourceSheet, type SourceSheetItem } from "@/features/web/details/SourceSheet";
import { withProfileQuery } from "@/lib/companion/profile-scope";

type Props = {
  open: boolean;
  onClose: () => void;
  mediaId: string;
  profileId: string;
  title: string;
  logoUrl?: string | null;
};

const REASON_HINT: Record<string, string> = {
  "no-addons": "Aucune source IPTV ou addon configurée. Ajoutez une playlist Xtream ou un addon Stremio depuis MegaCompagnon.",
  "no-imdb": "Identifiant IMDb introuvable pour ce titre — les addons ne peuvent pas le résoudre.",
  "no-streams": "Aucun flux lisible trouvé (torrents exclus en navigateur)."
};

const cache = new Map<string, { sources: SourceSheetItem[]; reason: string }>();

export function SourcePicker({ open, onClose, mediaId, profileId, title, logoUrl }: Props) {
  const router = useRouter();
  const [sources, setSources] = useState<SourceSheetItem[]>([]);
  const [reason, setReason] = useState("ok");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const load = async () => {
      const cached = cache.get(mediaId);
      if (cached) {
        if (active) {
          setSources(cached.sources);
          setReason(cached.reason);
          setLoading(false);
        }
        return;
      }
      if (active) setLoading(true);
      try {
        const res = await fetch(
          `/api/web/sources?mediaId=${encodeURIComponent(mediaId)}&profile=${encodeURIComponent(profileId)}`
        );
        if (!res.ok) throw new Error("http");
        const data = (await res.json()) as { sources?: SourceSheetItem[]; reason?: string };
        if (!active) return;
        const next = data.sources || [];
        const nextReason = data.reason || "ok";
        cache.set(mediaId, { sources: next, reason: nextReason });
        setSources(next);
        setReason(nextReason);
      } catch {
        if (active) {
          setSources([]);
          setReason("error");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [open, mediaId, profileId]);

  const launch = useCallback(
    (source: SourceSheetItem) => {
      const base = `/web/player/${mediaId}?src=${encodeURIComponent(source.url)}`;
      onClose();
      router.push(withProfileQuery(base, profileId));
    },
    [mediaId, profileId, router, onClose]
  );

  return (
    <SourceSheet
      open={open}
      onClose={onClose}
      title={title}
      logoUrl={logoUrl}
      loading={loading}
      sources={sources}
      onSelect={launch}
      emptyHint={REASON_HINT[reason] || (reason === "error" ? "Impossible de charger les sources." : "Aucune source trouvée.")}
    />
  );
}
