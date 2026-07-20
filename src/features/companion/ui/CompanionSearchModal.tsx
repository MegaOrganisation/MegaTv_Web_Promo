"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { MegaTvIcon, type MegaTvIconName } from "@/components/icons/MegaTvIcon";
import { LiquidGlassPopup } from "@/components/ui/LiquidGlassPopup";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

type CompanionHit = {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: MegaTvIconName;
  keywords: string[];
};

const COMPANION_INDEX: CompanionHit[] = [
  { id: "dash", label: "Dashboard", hint: "Vue d'ensemble, KPI, activité", href: "/companion", icon: "home", keywords: ["dashboard", "accueil", "kpi", "stats", "statistiques", "activité", "historique"] },
  { id: "watchlist", label: "Watchlist", hint: "Films et séries à voir", href: "/companion/watchlist", icon: "bookmark", keywords: ["watchlist", "liste", "favoris"] },
  { id: "calendar", label: "Calendrier", hint: "Visionnages et sorties", href: "/companion/calendar", icon: "calendar", keywords: ["calendrier", "agenda", "sorties", "visionnages"] },
  { id: "manage", label: "Gérer", hint: "IPTV, addons, catalogues", href: "/companion/manage", icon: "cloud", keywords: ["gérer", "manage", "iptv", "addons", "catalogues", "cloud"] },
  { id: "profiles", label: "Profils", hint: "Profils compte et Kids", href: "/companion/profiles", icon: "people", keywords: ["profils", "kids", "pin", "avatar"] },
  { id: "settings", label: "Réglages", hint: "Compte, fond, thème, sync", href: "/companion/settings", icon: "settings", keywords: ["réglages", "paramètres", "settings", "thème", "fond", "apparence", "sync"] },
  { id: "devices", label: "Appareils", hint: "TV et sessions liées", href: "/companion/devices", icon: "cast", keywords: ["appareils", "devices", "tv", "pairer", "cast"] },
  { id: "apparence", label: "Fond d'écran", hint: "Ambiance liquid glass", href: "/companion/settings#apparence", icon: "settings", keywords: ["fond", "ambiance", "ember", "aurora", "cosmic"] },
  { id: "admin", label: "Admin", hint: "Console plateforme", href: "/companion/admin", icon: "shield", keywords: ["admin", "console", "plateforme"] }
];

type Props = { open: boolean; onClose: () => void };

/** Recherche locale MegaCompagnon — pages / réglages / stats, pas TMDB. */
export function CompanionSearchModal({ open, onClose }: Props) {
  const { withProfile } = useCompanionProfile();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMPANION_INDEX;
    return COMPANION_INDEX.filter((hit) => {
      const hay = `${hit.label} ${hit.hint} ${hit.keywords.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <LiquidGlassPopup open={open} onClose={onClose} className="companion-search-popup">
      <div className="flex items-center gap-3 border-b border-white/10 px-1 pb-3">
        <Search className="h-5 w-5 shrink-0 text-white/45" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pages, réglages, stats Companion…"
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/40"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onClose}
          className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/12 text-white/60"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-3 max-h-[min(50vh,420px)] space-y-1 overflow-y-auto">
        {results.map((hit) => (
          <li key={hit.id}>
            <Link
              href={withProfile(hit.href)}
              onClick={onClose}
              className="focus-ring flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-white/8"
            >
              <MegaTvIcon name={hit.icon} size={18} className="text-white/70" />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-white">{hit.label}</span>
                <span className="block text-xs text-white/45">{hit.hint}</span>
              </span>
            </Link>
          </li>
        ))}
        {results.length === 0 ? <li className="px-3 py-6 text-center text-sm text-white/45">Aucun résultat</li> : null}
      </ul>
    </LiquidGlassPopup>
  );
}
