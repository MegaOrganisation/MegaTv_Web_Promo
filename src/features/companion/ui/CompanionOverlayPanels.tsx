"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

import { MegaTvMark } from "@/components/ui/MegaTvMark";
import { LiquidGlassPopup } from "@/components/ui/LiquidGlassPopup";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { QUICK_ACCESS_OPTIONS, readQuickAccessId, type QuickAccessId } from "@/features/companion/settings/quickAccess";
import { tmdbProxiedImageUrl } from "@/lib/tmdb";
import type { ContinueWatchingRow } from "@/lib/supabase/types";

const EXPOSE_ROUTES = [
  { href: "/companion", label: "Dashboard", gradient: "linear-gradient(135deg,#d8497f,#3f9ae6)" },
  { href: "/companion/watchlist", label: "Watchlist", gradient: "linear-gradient(135deg,#3f9ae6,#1fa8a0)" },
  { href: "/companion/manage", label: "Gérer", gradient: "linear-gradient(135deg,#f2b43c,#ee6a54)" },
  { href: "/companion/manage/profiles", label: "Profils", gradient: "linear-gradient(135deg,#5fbf5a,#1fa8a0)" },
  { href: "/companion/settings", label: "Réglages", gradient: "linear-gradient(135deg,#10191c,#3f9ae6)" },
  { href: "/companion/manage/devices", label: "Appareils", gradient: "linear-gradient(135deg,#d8497f,#3f9ae6)" }
];

function GlassModal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <LiquidGlassPopup open={open} onClose={onClose} title={title} wide={wide}>
      {children}
    </LiquidGlassPopup>
  );
}

export function ExposeViewPanel({ open, onClose, isAdmin }: { open: boolean; onClose: () => void; isAdmin?: boolean }) {
  const { withProfile } = useCompanionProfile();
  const routes = isAdmin ? [...EXPOSE_ROUTES, { href: "/companion/admin", label: "Admin", gradient: "linear-gradient(135deg,#ee6a54,#d8497f)" }] : EXPOSE_ROUTES;

  return (
    <GlassModal open={open} onClose={onClose} title="Vue éclatée" wide>
      <p className="mb-4 text-sm text-white/50">Aperçu des sections MegaCompagnon — style Mission Control.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={withProfile(route.href)}
            onClick={onClose}
            className="expose-tile focus-ring group"
          >
            <div className="expose-tile__preview" style={{ background: route.gradient }}>
              <MegaTvMark size={28} className="opacity-80" />
            </div>
            <p className="expose-tile__label">{route.label}</p>
          </Link>
        ))}
      </div>
    </GlassModal>
  );
}

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<Array<{ title: string; meta: string; kind: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void Promise.all([
      fetch("/api/companion/continue-watching").then((r) => (r.ok ? r.json() : { items: [] })),
      fetch("/api/companion/notifications").then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] }))
    ])
      .then(([cw, notif]) => {
        const cwRows = (cw.items ?? []) as ContinueWatchingRow[];
        const merged = [
          ...(notif.items ?? []).map((n: { title: string; meta: string; kind: string }) => n),
          ...cwRows.slice(0, 3).map((row) => ({
            title: row.title || `TMDB ${row.tmdb_id}`,
            meta: "Reprise synchronisée depuis MegaTv",
            kind: "continue"
          }))
        ];
        setItems(merged);
      })
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <GlassModal open={open} onClose={onClose} title="Notifications">
      {loading ? <p className="text-sm text-white/45">Chargement…</p> : null}
      {!loading && items.length === 0 ? (
        <p className="text-sm text-white/45">Aucune alerte — épisodes watchlist et sorties TMDB apparaîtront ici.</p>
      ) : null}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={`${item.title}-${i}`} className="premium-lg-list-item">
            <span className="premium-lg-list-dot" />
            <div>
              <p className="font-semibold text-white/90">{item.title}</p>
              <p className="text-xs text-white/45">{item.meta}</p>
            </div>
          </li>
        ))}
      </ul>
    </GlassModal>
  );
}

export function CalendarPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { withProfile } = useCompanionProfile();
  const [tab, setTab] = useState<"history" | "releases">("history");
  const [history, setHistory] = useState<ContinueWatchingRow[]>([]);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/companion/continue-watching")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((json) => setHistory(json.items ?? []));
  }, [open]);

  return (
    <GlassModal open={open} onClose={onClose} title="Calendrier" wide>
      <div className="mb-4 flex gap-2">
        <button type="button" className={clsx("mega-cinema-chip-btn", tab === "history" && "is-active")} onClick={() => setTab("history")}>
          Historique
        </button>
        <button type="button" className={clsx("mega-cinema-chip-btn", tab === "releases" && "is-active")} onClick={() => setTab("releases")}>
          Sorties
        </button>
      </div>
      {tab === "history" ? (
        <ul className="space-y-2">
          {history.slice(0, 8).map((row) => (
            <li key={row.track_id} className="premium-lg-list-item">
              <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                {(row.backdrop_path || row.poster_path) ? (
                  <img src={tmdbProxiedImageUrl(row.backdrop_path || row.poster_path, "w185") ?? ""} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white/90">{row.title}</p>
                <p className="text-xs text-white/45">Visionnage récent</p>
              </div>
            </li>
          ))}
          <Link href={withProfile("/companion")} onClick={onClose} className="mt-2 inline-block text-sm font-semibold text-[var(--brand-blue)]">
            Voir l&apos;historique complet →
          </Link>
        </ul>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
          <p>Sorties films & séries (watchlist) — synchronisation TMDB à venir.</p>
          <Link href={withProfile("/companion/watchlist")} onClick={onClose} className="mt-3 inline-block font-semibold text-[var(--brand-blue)]">
            Ouvrir la watchlist →
          </Link>
        </div>
      )}
    </GlassModal>
  );
}

export function QuickAccessPanel({ open, onClose, isAdmin }: { open: boolean; onClose: () => void; isAdmin?: boolean }) {
  const { withProfile } = useCompanionProfile();
  const [target, setTarget] = useState<QuickAccessId>("watchlist");

  useEffect(() => {
    if (open) setTarget(readQuickAccessId());
  }, [open]);

  const option = QUICK_ACCESS_OPTIONS.find((o) => o.id === target) ?? QUICK_ACCESS_OPTIONS[1]!;
  if (option.adminOnly && !isAdmin) return null;

  return (
    <GlassModal open={open} onClose={onClose} title="Accès rapide">
      <p className="mb-4 text-sm text-white/50">Raccourci configurable dans Réglages.</p>
      <Link
        href={withProfile(option.href)}
        onClick={onClose}
        className="premium-lg-quick-link focus-ring"
      >
        {option.label} →
      </Link>
    </GlassModal>
  );
}
