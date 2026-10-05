"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Film,
  Monitor,
  Palette,
  PlaySquare,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Smartphone,
  Sparkles,
  Upload,
  Volume2,
} from "lucide-react";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

/* ─── CONSTANTES & COULEURS CONFORMES ANDROID ───────────────────────────── */

const PRESET_COLORS = [
  { name: "White",  label: "Blanc",   hex: "#FFFFFF" },
  { name: "Red",    label: "Rouge",   hex: "#E50914" },
  { name: "Orange", label: "Orange",  hex: "#F59E0B" },
  { name: "Yellow", label: "Jaune",   hex: "#FFDD44" },
  { name: "Green",  label: "Vert",    hex: "#1DB954" },
  { name: "Blue",   label: "Bleu",    hex: "#3B82F6" },
  { name: "Indigo", label: "Indigo",  hex: "#6366F1" },
  { name: "Violet", label: "Violet",  hex: "#EC4899" },
];

/** Palette Android des fonds personnalisés (AppBackgroundSwatches) */
const APP_BACKGROUND_SWATCHES = [
  { argb: 0xFF2C444C, hex: "#2C444C", label: "Bleu canard" },
  { argb: 0xFF507C8B, hex: "#507C8B", label: "Bleu ardoise" },
  { argb: 0xFF1A3A4A, hex: "#1A3A4A", label: "Bleu sarcelle" },
  { argb: 0xFF3D2C2E, hex: "#3D2C2E", label: "Brun chaud" },
  { argb: 0xFF1E2A38, hex: "#1E2A38", label: "Bleu nuit" },
  { argb: 0xFF2A3520, hex: "#2A3520", label: "Vert forêt" },
  { argb: 0xFF3A2430, hex: "#3A2430", label: "Bordeaux" },
  { argb: 0xFF252530, hex: "#252530", label: "Gris ardoise" },
  { argb: 0xFF000000, hex: "#000000", label: "Noir absolu" },
];

const NUANCIER_GRID = [
  ["#FFFFFF", "#E2E8F0", "#94A3B8", "#64748B", "#334155", "#1E293B"],
  ["#EF4444", "#DC2626", "#B91C1C", "#F87171", "#FB7185", "#E11D48"],
  ["#F97316", "#EA580C", "#F59E0B", "#D97706", "#EAB308", "#CA8A04"],
  ["#22C55E", "#16A34A", "#10B981", "#059669", "#14B8A6", "#0D9488"],
  ["#06B6D4", "#0891B2", "#0EA5E9", "#0284C7", "#3B82F6", "#2563EB"],
  ["#6366F1", "#4F46E5", "#8B5CF6", "#7C3AED", "#A855F7", "#EC4899"],
];

const POSTER_PREVIEW_POSTER_URL = "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg";
const POSTER_PREVIEW_BACKDROP_URL = "https://image.tmdb.org/t/p/w780/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg";

/** Langues complètes disponibles pour les sous-titres */
const SUBTITLE_LANGUAGES = [
  { value: "Off", label: "Désactivés" },
  { value: "French", label: "Français" },
  { value: "English", label: "Anglais" },
  { value: "Spanish", label: "Espagnol" },
  { value: "German", label: "Allemand" },
  { value: "Italian", label: "Italien" },
  { value: "Portuguese", label: "Portugais" },
  { value: "Portuguese (Brazil)", label: "Portugais (Brésil)" },
  { value: "Arabic", label: "Arabe" },
  { value: "Russian", label: "Russe" },
  { value: "Japanese", label: "Japonais" },
  { value: "Korean", label: "Coréen" },
  { value: "Chinese", label: "Chinois" },
  { value: "Dutch", label: "Néerlandais" },
  { value: "Turkish", label: "Turc" },
  { value: "Polish", label: "Polonais" },
  { value: "Swedish", label: "Suédois" },
  { value: "Norwegian", label: "Norvégien" },
  { value: "Danish", label: "Danois" },
  { value: "Finnish", label: "Finnois" },
  { value: "Greek", label: "Grec" },
  { value: "Czech", label: "Tchèque" },
  { value: "Hungarian", label: "Hongrois" },
  { value: "Romanian", label: "Roumain" },
  { value: "Thai", label: "Thaï" },
  { value: "Vietnamese", label: "Vietnamien" },
  { value: "Indonesian", label: "Indonésien" },
  { value: "Hebrew", label: "Hébreu" },
  { value: "Hindi", label: "Hindi" },
  { value: "Ukrainian", label: "Ukrainien" },
  { value: "Croatian", label: "Croate" },
  { value: "Slovak", label: "Slovaque" },
  { value: "Slovenian", label: "Slovène" },
  { value: "Bulgarian", label: "Bulgare" },
];

/** Langues audio disponibles */
const AUDIO_LANGUAGES = [
  { value: "auto", label: "Automatique (Original)" },
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "de", label: "Allemand" },
  { value: "it", label: "Italien" },
  { value: "pt", label: "Portugais" },
  { value: "ja", label: "Japonais" },
  { value: "ko", label: "Coréen" },
  { value: "zh", label: "Chinois" },
  { value: "ru", label: "Russe" },
  { value: "ar", label: "Arabe" },
  { value: "hi", label: "Hindi" },
  { value: "tr", label: "Turc" },
  { value: "pl", label: "Polonais" },
  { value: "nl", label: "Néerlandais" },
];

/** Parse une valeur brute de sous-titre vers langue de base et booléen forcé */
function parseSubtitleValue(raw: string | undefined): { lang: string; forced: boolean } {
  const s = (raw || "Off").trim();
  if (!s || s.toLowerCase() === "off") return { lang: "Off", forced: false };
  if (s.toLowerCase() === "forced") return { lang: "French", forced: true };
  const forced = /[\(\[]?\s*(forced|forcé)s?\s*[\)\]]?/i.test(s);
  const lang = s.replace(/[\(\[]?\s*(forced|forcé)s?\s*[\)\]]?/i, "").trim() || (forced ? "French" : "Off");
  return { lang, forced };
}

/** Formate la valeur de sous-titre pour la sauvegarde synchronisée */
function formatSubtitleValue(lang: string, forced: boolean): string {
  if (!lang || lang === "Off") return "Off";
  if (forced) return `${lang} (Forced)`;
  return lang;
}

const TABS = [
  { id: "appearance", label: "Interface & Thème",   icon: Palette },
  { id: "posters",    label: "Posters & Accueil",   icon: Film },
  { id: "playback",   label: "Lecture & CW",        icon: PlaySquare },
  { id: "subtitles",  label: "Sous-titres & Audio", icon: Volume2 },
  { id: "mobile",     label: "Mobile",              icon: Smartphone },
] as const;

type TabId = typeof TABS[number]["id"];

/* ─── COMPOSANTS UI DE BASE ──────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
      {children}
    </h3>
  );
}

function SettingCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 sm:p-5 backdrop-blur-md transition-all ${className}`}>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer py-2.5 group">
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs sm:text-sm font-medium text-white/90 group-hover:text-white transition-colors">{label}</p>
        {sub && <p className="text-[11px] text-white/40 mt-0.5 leading-snug">{sub}</p>}
      </div>
      <div
        className={`w-10 h-5.5 sm:w-11 sm:h-6 rounded-full transition-all duration-200 relative shrink-0 ${
          checked ? "bg-indigo-500 shadow-sm shadow-indigo-500/50" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? "translate-x-4.5 sm:translate-x-5" : "translate-x-0"
          }`}
        />
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
      </div>
    </label>
  );
}

/* ─── APERÇUS RÉALISTES IDENTIQUES À L'APPLICATION ───────────────────────── */

/** 1. ThemePreviewScreenMockup */
function ThemePreviewScreenMockup({
  mode,
  customArgb,
  focusHex,
}: {
  mode: string;
  customArgb: number;
  focusHex: string;
}) {
  let bg = "#0D111A";
  if (mode === "cover") {
    bg = "#180B0E";
  } else if (mode === "custom") {
    const hex = APP_BACKGROUND_SWATCHES.find((s) => s.argb === customArgb)?.hex;
    bg = hex || "#1E2A38";
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="w-full max-w-[310px] rounded-2xl p-1.5 shadow-2xl transition-all duration-300"
        style={{
          background: "linear-gradient(to bottom, #162132, #0A0F18)",
          border: "1.5px solid #334560",
          boxShadow: `0 8px 24px ${focusHex}26`,
        }}
      >
        <div
          className="w-full h-34 rounded-xl p-2.5 flex flex-col justify-between border border-white/10 overflow-hidden transition-colors duration-300"
          style={{ background: bg }}
        >
          {/* Top Bar Capsule */}
          <div className="flex items-center justify-between rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-1.5">
              <div
                className="px-2 py-0.5 rounded-full text-[9px] font-bold text-black flex items-center gap-1 shadow-sm transition-all"
                style={{ backgroundColor: focusHex }}
              >
                <span>🏠</span>
                <span>Accueil</span>
              </div>
              <div className="px-1.5 text-[9px] text-white/50">Explorer</div>
              <div className="px-1.5 text-[9px] text-white/50">Direct</div>
            </div>
            <div className="w-4 h-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[8px]">
              👤
            </div>
          </div>

          {/* Hero Banner Centre */}
          <div className="w-full h-10 rounded-lg bg-gradient-to-r from-white/10 to-transparent border border-white/10 p-2 flex flex-col justify-center">
            <div className="h-1.5 w-16 bg-white/90 rounded mb-1" />
            <div className="h-1 w-24 bg-white/40 rounded" />
          </div>

          {/* Rangée de Miniatures */}
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-5.5 rounded bg-neutral-800/80 border transition-all"
                style={{
                  borderColor: i === 0 ? focusHex : "rgba(255,255,255,0.08)",
                  boxShadow: i === 0 ? `0 0 6px ${focusHex}88` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-white/80 mt-2">Aperçu TV & Focus D-Pad</span>
      <span className="text-[10px] text-white/40">
        {mode === "original"
          ? "Original Dark (#0D111A)"
          : mode === "cover"
          ? "Couverture (Ambiance jaquette)"
          : `Personnalisé (${APP_BACKGROUND_SWATCHES.find((s) => s.argb === customArgb)?.label || "Teinte"})`}
      </span>
    </div>
  );
}

/** 2. PosterLivePreview */
function PosterLivePreview({
  mode,
  radiusDp,
  focusColorMode,
  focusAlpha,
  resolvedFocusHex,
}: {
  mode: string;
  radiusDp: number;
  focusColorMode: string;
  focusAlpha: number;
  resolvedFocusHex: string;
}) {
  const isLandscape = mode === "landscape";
  const baseBorderColor = focusColorMode === "white" ? "#FFFFFF" : resolvedFocusHex;
  const alphaFactor = Math.max(0.1, Math.min(1, focusAlpha / 100));

  const hexToRgba = (hex: string, alpha: number) => {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  };

  const matColor = hexToRgba(baseBorderColor, alphaFactor);
  const imageUrl = isLandscape ? POSTER_PREVIEW_BACKDROP_URL : POSTER_PREVIEW_POSTER_URL;

  return (
    <div className="flex flex-col items-center">
      <div
        className="transition-all duration-200 flex flex-col items-center shadow-2xl"
        style={{
          padding: "4px",
          backgroundColor: matColor,
          borderRadius: `${radiusDp + 4}px`,
        }}
      >
        <div
          className="relative overflow-hidden bg-neutral-900 transition-all duration-200"
          style={{
            width: isLandscape ? 190 : 120,
            height: isLandscape ? 107 : 175,
            borderRadius: `${radiusDp}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Poster preview"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-2 left-2 flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500 border border-black text-[9px] flex items-center justify-center font-bold text-white shadow">
              S
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-500 border border-black text-[9px] flex items-center justify-center font-bold text-white shadow">
              C
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-center gap-1 mt-1 mb-0.5"
          style={{ width: isLandscape ? 190 : 120, height: "18px" }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              viewBox="0 0 24 24"
              className="w-3 h-3 fill-current"
              style={{ color: star <= 4 ? "#FFFFFF" : "rgba(255,255,255,0.3)" }}
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className="text-xs font-semibold text-white/90 block">
          {isLandscape ? "Paysage 16:9" : "Portrait 2:3"} · {radiusDp} dp
        </span>
        <span className="text-[10px] text-emerald-400 font-medium">Source : TMDB Officiel</span>
      </div>
    </div>
  );
}

/** 3. CwMockupPreview */
function CwMockupPreview({
  style,
  selected,
  onClick,
}: {
  style: "carte" | "paysage" | "poster";
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-2.5 border transition-all text-left flex flex-col justify-between ${
        selected
          ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="h-14 w-full rounded-lg bg-neutral-900 border border-white/10 p-2 flex items-center justify-center mb-2 overflow-hidden">
        {style === "carte" && (
          <div className="w-full flex items-center gap-2">
            <div className="w-8 h-10 rounded bg-neutral-700 shrink-0 border border-white/15" />
            <div className="flex-1 space-y-1.5">
              <div className="h-1.5 w-3/4 rounded bg-white/80" />
              <div className="h-1 w-1/2 rounded bg-white/40" />
              <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-2/3 bg-red-500" />
              </div>
            </div>
          </div>
        )}

        {style === "paysage" && (
          <div className="w-full h-10 rounded-lg bg-neutral-800 border border-white/15 p-1.5 flex flex-col justify-between">
            <div className="flex justify-end">
              <span className="text-[7px] px-1 rounded bg-black/60 text-white/60">Ép. 4</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-2/3 rounded bg-white/80" />
              <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-1/2 bg-red-500" />
              </div>
            </div>
          </div>
        )}

        {style === "poster" && (
          <div className="w-7 h-10 rounded bg-neutral-800 border border-white/15 p-1 flex flex-col justify-end">
            <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden mb-0.5">
              <div className="h-full w-3/4 bg-red-500" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-semibold text-white capitalize">
          {style === "carte" ? "Carte (Défaut)" : style === "paysage" ? "Paysage 16:9" : "Poster 2:3"}
        </span>
        {selected && (
          <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">
            ✓
          </span>
        )}
      </div>
    </button>
  );
}

/** 4. MobileNavPhoneWireframe */
function MobileNavPhoneWireframe({
  styleKey,
  selected,
  glowEnabled,
  onClick,
}: {
  styleKey: "separated" | "grouped" | "classic";
  selected: boolean;
  glowEnabled: boolean;
  onClick: () => void;
}) {
  const titles = {
    separated: "Profil séparé",
    grouped: "Groupé (Capsule)",
    classic: "Classique",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-2.5 border transition-all flex flex-col items-center gap-2 ${
        selected
          ? "border-white bg-white/10 shadow-lg shadow-indigo-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="w-18 h-26 rounded-xl bg-neutral-950 border border-white/20 p-1.5 flex flex-col justify-between relative overflow-hidden">
        <div className="w-6 h-1 rounded-full bg-white/30 mx-auto" />
        <div className="space-y-1 my-auto">
          <div className="h-1 w-8 rounded bg-white/20" />
          <div className="h-5 w-full rounded bg-white/5 border border-white/10" />
          <div className="h-1 w-12 rounded bg-white/15" />
        </div>

        <div className="relative">
          {glowEnabled && (
            <div className="absolute -inset-1 bg-indigo-500/30 blur-sm rounded-full" />
          )}

          {styleKey === "separated" && (
            <div className="flex items-center justify-between gap-1 relative z-10">
              <div className="flex-1 h-3 rounded-full bg-white/20 border border-white/30 flex items-center justify-around px-1">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <div className="w-1 h-1 rounded-full bg-white/40" />
              </div>
              <div className="w-3 h-3 rounded-full bg-white/30 border border-white/50 shrink-0" />
            </div>
          )}

          {styleKey === "grouped" && (
            <div className="h-3 rounded-full bg-white/20 border border-white/30 flex items-center justify-around px-1 relative z-10">
              <div className="w-1 h-1 rounded-full bg-white" />
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="w-1 h-1 rounded-full bg-white/40" />
            </div>
          )}

          {styleKey === "classic" && (
            <div className="h-3 w-full bg-neutral-800 border-t border-white/20 flex items-center justify-around relative z-10">
              <div className="w-1.5 h-1.5 rounded-sm bg-white" />
              <div className="w-1.5 h-1.5 rounded-sm bg-white/40" />
              <div className="w-1.5 h-1.5 rounded-sm bg-white/40" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-[11px] font-semibold text-white text-center">{titles[styleKey]}</span>
        <div
          className={`w-3.5 h-3.5 rounded-full border mt-1 flex items-center justify-center ${
            selected ? "border-white" : "border-white/30"
          }`}
        >
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

/** 5. EpisodeCardStyleWireframe */
function EpisodeCardStyleWireframe({
  styleKey,
  selected,
  onClick,
}: {
  styleKey: "horizontal" | "list";
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-2.5 border transition-all flex flex-col items-center gap-2 ${
        selected
          ? "border-white bg-white/10 shadow-lg shadow-indigo-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="w-full h-26 rounded-xl bg-neutral-950 border border-white/20 p-2 flex flex-col justify-between">
        <div className="w-7 h-1 rounded-full bg-white/30 mx-auto" />

        {styleKey === "horizontal" ? (
          <div className="space-y-1.5 my-auto">
            <div className="w-full h-7 rounded bg-white/15 border border-white/10" />
            <div className="w-full h-7 rounded bg-white/15 border border-white/10" />
          </div>
        ) : (
          <div className="space-y-1 my-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-5 h-3.5 rounded bg-white/20 shrink-0" />
                <div className="space-y-0.5 flex-1">
                  <div className="h-1 w-full bg-white/40 rounded" />
                  <div className="h-0.5 w-2/3 bg-white/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-1 w-full bg-white/10 rounded" />
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold text-white">
          {styleKey === "horizontal" ? "Horizontal (Grille)" : "Liste compacte"}
        </span>
        <div
          className={`w-3.5 h-3.5 rounded-full border mt-1 flex items-center justify-center ${
            selected ? "border-white" : "border-white/30"
          }`}
        >
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

/* ─── COMPOSANT PRINCIPAL ────────────────────────────────────────────────── */

export function ManageSettingsPanel() {
  const companionProfile = useCompanionProfile();
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("appearance");

  // 1. Interface & Thème
  const [focusBorderColor, setFocusBorderColor] = useState("White");
  const [focusCustomHex, setFocusCustomHex] = useState("#FFFFFF");
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [showNuancier, setShowNuancier] = useState(false);
  const [appBackgroundMode, setAppBackgroundMode] = useState("original"); // "original" | "cover" | "custom"
  const [appBackgroundCustomArgb, setAppBackgroundCustomArgb] = useState<number>(0xFF2C444C);
  const [profilePickerBackground, setProfilePickerBackground] = useState("glow"); // "glow" | "wave" | "continue_watching"
  const [detailsAmbientColor, setDetailsAmbientColor] = useState(true);
  const [profileAmbientColor, setProfileAmbientColor] = useState(true);
  const [megatvIntroAnimationEnabled, setMegatvIntroAnimationEnabled] = useState(true);
  const [uiNavSoundsEnabled, setUiNavSoundsEnabled] = useState(true);
  const [clockFormat, setClockFormat] = useState("24h");
  const [skipProfileSelection, setSkipProfileSelection] = useState(false);

  // 2. Posters & Accueil
  const [cardLayoutMode, setCardLayoutMode] = useState("landscape");
  const [posterCardRadiusDp, setPosterCardRadiusDp] = useState(28);
  const [posterFocusColorMode, setPosterFocusColorMode] = useState("profile");
  const [posterFocusAlpha, setPosterFocusAlpha] = useState(100);
  const [posterArtLang, setPosterArtLang] = useState("fr");
  const [spoilerBlurEnabled, setSpoilerBlurEnabled] = useState(false);
  const [posterFriendsWatching, setPosterFriendsWatching] = useState(true);
  const [posterFriendsCompleted, setPosterFriendsCompleted] = useState(true);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverSynced, setCoverSynced] = useState(false);

  // 3. Lecture & Continue Watching
  const [continueWatchingCardStyle, setContinueWatchingCardStyle] = useState<"carte" | "paysage" | "poster">("carte");
  const [cwPreferEpisodeThumbnail, setCwPreferEpisodeThumbnail] = useState(false);
  const [episodeCardStyle, setEpisodeCardStyle] = useState<"horizontal" | "list">("horizontal");
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [autoPlaySingleSource, setAutoPlaySingleSource] = useState(true);
  const [autoPlayMinQuality, setAutoPlayMinQuality] = useState("Any");
  const [trailerAutoPlay, setTrailerAutoPlay] = useState(false);
  const [trailerSoundEnabled, setTrailerSoundEnabled] = useState(false);
  const [trailerFullscreenEnabled, setTrailerFullscreenEnabled] = useState(true);
  const [heroTrailerDelaySeconds, setHeroTrailerDelaySeconds] = useState(5);
  const [heroTrailerFullscreenDelaySeconds, setHeroTrailerFullscreenDelaySeconds] = useState(8);

  // 4. Sous-titres & Audio (Avec gestion fine de la langue et de l'état Forced)
  const [defaultAudioLanguage, setDefaultAudioLanguage] = useState("auto");
  const [defaultSubtitle, setDefaultSubtitle] = useState("Off");
  const [defaultSubLang, setDefaultSubLang] = useState("Off");
  const [defaultSubForced, setDefaultSubForced] = useState(false);

  const [secondarySubtitle, setSecondarySubtitle] = useState("Off");
  const [secondarySubLang, setSecondarySubLang] = useState("Off");
  const [secondarySubForced, setSecondarySubForced] = useState(false);

  const [subtitleSize, setSubtitleSize] = useState("Medium");
  const [subtitleColor, setSubtitleColor] = useState("White");
  const [subtitleStyle, setSubtitleStyle] = useState("Bold");
  const [subtitleOffset, setSubtitleOffset] = useState("Bottom");
  const [filterSubtitlesByLanguage, setFilterSubtitlesByLanguage] = useState(true);
  const [subtitleStylized, setSubtitleStylized] = useState(true);

  // 5. Mobile
  const [mobileNavBarStyle, setMobileNavBarStyle] = useState<"separated" | "grouped" | "classic">("grouped");
  const [mobileNavGlowEnabled, setMobileNavGlowEnabled] = useState(true);

  const resolvedFocusHex = useCustomColor
    ? focusCustomHex
    : (PRESET_COLORS.find((c) => c.name.toLowerCase() === focusBorderColor.toLowerCase())?.hex ?? "#FFFFFF");

  /* ── Chargement des profils ── */
  useEffect(() => {
    fetch("/api/profiles/active")
      .then((r) => r.json())
      .then((data) => {
        if (data.profiles?.length) {
          setProfiles(data.profiles);
          const id = companionProfile?.activeProfileId ?? data.activeProfileId ?? data.profiles[0].id;
          setSelectedProfileId(id);
        }
      })
      .catch(console.error);
  }, [companionProfile?.activeProfileId]);

  /* ── Sync contexte profil ── */
  useEffect(() => {
    if (companionProfile?.activeProfileId && companionProfile.activeProfileId !== selectedProfileId) {
      setSelectedProfileId(companionProfile.activeProfileId);
    }
  }, [companionProfile?.activeProfileId, selectedProfileId]);

  /* ── Chargement des réglages du profil ── */
  useEffect(() => {
    if (!selectedProfileId) return;
    setLoading(true);
    fetch(`/api/companion/settings?profileId=${selectedProfileId}`)
      .then((r) => r.json())
      .then(({ settings: s = {} }) => {
        if (s.focus_border_color) {
          if (s.focus_border_color.startsWith("#")) {
            setUseCustomColor(true);
            setFocusCustomHex(s.focus_border_color);
          } else {
            setUseCustomColor(false);
            setFocusBorderColor(s.focus_border_color);
          }
        }
        if (s.app_background_mode) {
          const bgm = s.app_background_mode.toLowerCase();
          setAppBackgroundMode(bgm === "cover" ? "cover" : bgm === "custom" ? "custom" : "original");
        }
        if (s.app_background_custom_argb !== undefined) {
          setAppBackgroundCustomArgb(Number(s.app_background_custom_argb));
        }
        if (s.profile_picker_background) {
          const ppb = s.profile_picker_background.toLowerCase();
          setProfilePickerBackground(
            ppb === "wave" ? "wave" : ppb === "continue_watching" ? "continue_watching" : "glow"
          );
        }
        if (s.details_ambient_color !== undefined) setDetailsAmbientColor(Boolean(s.details_ambient_color));
        if (s.profile_ambient_color !== undefined) setProfileAmbientColor(Boolean(s.profile_ambient_color));
        if (s.megatv_intro_animation_enabled !== undefined) setMegatvIntroAnimationEnabled(Boolean(s.megatv_intro_animation_enabled));
        if (s.ui_nav_sounds_enabled !== undefined) setUiNavSoundsEnabled(Boolean(s.ui_nav_sounds_enabled));
        if (s.clock_format) setClockFormat(s.clock_format);
        if (s.skip_profile_selection !== undefined) setSkipProfileSelection(Boolean(s.skip_profile_selection));

        if (s.card_layout_mode) setCardLayoutMode(s.card_layout_mode);
        if (s.poster_card_radius_dp !== undefined) setPosterCardRadiusDp(Number(s.poster_card_radius_dp));
        if (s.poster_focus_color_mode) setPosterFocusColorMode(s.poster_focus_color_mode);
        if (s.poster_focus_alpha !== undefined) setPosterFocusAlpha(Number(s.poster_focus_alpha));
        if (s.poster_art_lang) setPosterArtLang(s.poster_art_lang);
        if (s.spoiler_blur_enabled !== undefined) setSpoilerBlurEnabled(Boolean(s.spoiler_blur_enabled));
        if (s.poster_friends_watching !== undefined) setPosterFriendsWatching(Boolean(s.poster_friends_watching));
        if (s.poster_friends_completed !== undefined) setPosterFriendsCompleted(Boolean(s.poster_friends_completed));

        if (s.continue_watching_card_style) {
          const rawCw = s.continue_watching_card_style.toLowerCase();
          setContinueWatchingCardStyle(rawCw === "paysage" ? "paysage" : rawCw === "poster" ? "poster" : "carte");
        }
        if (s.cw_prefer_episode_thumbnail !== undefined) setCwPreferEpisodeThumbnail(Boolean(s.cw_prefer_episode_thumbnail));
        if (s.episode_card_style) {
          setEpisodeCardStyle(s.episode_card_style.toLowerCase() === "list" ? "list" : "horizontal");
        }

        if (s.auto_play_next !== undefined) setAutoPlayNext(Boolean(s.auto_play_next));
        if (s.auto_play_single_source !== undefined) setAutoPlaySingleSource(Boolean(s.auto_play_single_source));
        if (s.auto_play_min_quality) setAutoPlayMinQuality(s.auto_play_min_quality);
        if (s.trailer_auto_play !== undefined) setTrailerAutoPlay(Boolean(s.trailer_auto_play));
        if (s.trailer_sound_enabled !== undefined) setTrailerSoundEnabled(Boolean(s.trailer_sound_enabled));
        if (s.trailer_fullscreen_enabled !== undefined) setTrailerFullscreenEnabled(Boolean(s.trailer_fullscreen_enabled));
        if (s.hero_trailer_delay_seconds !== undefined) setHeroTrailerDelaySeconds(Number(s.hero_trailer_delay_seconds));
        if (s.hero_trailer_fullscreen_delay_seconds !== undefined) setHeroTrailerFullscreenDelaySeconds(Number(s.hero_trailer_fullscreen_delay_seconds));

        if (s.default_audio_language) setDefaultAudioLanguage(s.default_audio_language);

        // Sous-titres principaux
        if (s.default_subtitle) {
          setDefaultSubtitle(s.default_subtitle);
          const parsed = parseSubtitleValue(s.default_subtitle);
          setDefaultSubLang(parsed.lang);
          setDefaultSubForced(parsed.forced);
        } else {
          setDefaultSubtitle("Off");
          setDefaultSubLang("Off");
          setDefaultSubForced(false);
        }

        // Sous-titres secondaires
        if (s.secondary_subtitle) {
          setSecondarySubtitle(s.secondary_subtitle);
          const parsedSec = parseSubtitleValue(s.secondary_subtitle);
          setSecondarySubLang(parsedSec.lang);
          setSecondarySubForced(parsedSec.forced);
        } else {
          setSecondarySubtitle("Off");
          setSecondarySubLang("Off");
          setSecondarySubForced(false);
        }

        if (s.subtitle_size) setSubtitleSize(s.subtitle_size);
        if (s.subtitle_color) setSubtitleColor(s.subtitle_color);
        if (s.subtitle_style) setSubtitleStyle(s.subtitle_style);
        if (s.subtitle_offset) setSubtitleOffset(s.subtitle_offset);
        if (s.filter_subtitles_by_language !== undefined) setFilterSubtitlesByLanguage(Boolean(s.filter_subtitles_by_language));
        if (s.subtitle_stylized !== undefined) setSubtitleStylized(Boolean(s.subtitle_stylized));

        if (s.mobile_nav_bar_style) {
          const rawNav = s.mobile_nav_bar_style.toLowerCase();
          setMobileNavBarStyle(rawNav === "separated" ? "separated" : rawNav === "classic" ? "classic" : "grouped");
        }
        if (s.mobile_nav_glow_enabled !== undefined) setMobileNavGlowEnabled(Boolean(s.mobile_nav_glow_enabled));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProfileId]);

  /* ── Sauvegarde synchronisée ── */
  async function handleSave() {
    if (!selectedProfileId) return;
    setSaving(true);
    setSaveSuccess(false);

    const resolvedDefSub = formatSubtitleValue(defaultSubLang, defaultSubForced);
    const resolvedSecSub = formatSubtitleValue(secondarySubLang, secondarySubForced);

    try {
      const res = await fetch("/api/companion/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfileId,
          settings: {
            focus_border_color: useCustomColor ? focusCustomHex : focusBorderColor,
            app_background_mode: appBackgroundMode,
            app_background_custom_argb: appBackgroundCustomArgb,
            oled_black_background: appBackgroundMode === "custom" && appBackgroundCustomArgb === 0xFF000000,
            profile_picker_background: profilePickerBackground,
            details_ambient_color: detailsAmbientColor,
            profile_ambient_color: profileAmbientColor,
            megatv_intro_animation_enabled: megatvIntroAnimationEnabled,
            ui_nav_sounds_enabled: uiNavSoundsEnabled,
            clock_format: clockFormat,
            skip_profile_selection: skipProfileSelection,

            card_layout_mode: cardLayoutMode,
            poster_card_radius_dp: posterCardRadiusDp,
            poster_focus_color_mode: posterFocusColorMode,
            poster_focus_alpha: posterFocusAlpha,
            poster_art_lang: posterArtLang,
            poster_art_provider: "tmdb",
            spoiler_blur_enabled: spoilerBlurEnabled,
            poster_friends_watching: posterFriendsWatching,
            poster_friends_completed: posterFriendsCompleted,

            continue_watching_card_style: continueWatchingCardStyle,
            cw_prefer_episode_thumbnail: cwPreferEpisodeThumbnail,
            episode_card_style: episodeCardStyle,

            auto_play_next: autoPlayNext,
            auto_play_single_source: autoPlaySingleSource,
            auto_play_min_quality: autoPlayMinQuality,
            trailer_auto_play: trailerAutoPlay,
            trailer_sound_enabled: trailerSoundEnabled,
            trailer_fullscreen_enabled: trailerFullscreenEnabled,
            hero_trailer_delay_seconds: heroTrailerDelaySeconds,
            hero_trailer_fullscreen_delay_seconds: heroTrailerFullscreenDelaySeconds,

            default_audio_language: defaultAudioLanguage,
            default_subtitle: resolvedDefSub,
            secondary_subtitle: resolvedSecSub,
            subtitle_size: subtitleSize,
            subtitle_color: subtitleColor,
            subtitle_style: subtitleStyle,
            subtitle_offset: subtitleOffset,
            filter_subtitles_by_language: filterSubtitlesByLanguage,
            subtitle_stylized: subtitleStylized,

            mobile_nav_bar_style: mobileNavBarStyle,
            mobile_nav_glow_enabled: mobileNavGlowEnabled,
          },
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Save error", e);
    } finally {
      setSaving(false);
    }
  }

  /* ── Téléversement bannière profil (< 40 Ko vers Supabase Storage) ── */
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedProfileId) return;
    setCoverUploading(true);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 960;
          let w = img.width, h = img.height;
          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context failed"));
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Blob error"))), "image/jpeg", 0.75);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      const fd = new FormData();
      fd.append("file", blob, "cover.jpg");
      const res = await fetch(`/api/profiles/${selectedProfileId}/cover`, { method: "POST", body: fd });
      if (res.ok) {
        setCoverSynced(true);
        setTimeout(() => setCoverSynced(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── BARRE SUPÉRIEURE : PROFIL & BOUTON SYNC ── */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Sliders className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Réglages TV & Mobile</h1>
            <p className="text-xs text-white/45">Synchronisation instantanée Nuvio (MegaSync) vers tous vos appareils.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {profiles.length > 0 && (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xs text-white/50">Profil :</span>
              <select
                value={selectedProfileId}
                onChange={(e) => {
                  setSelectedProfileId(e.target.value);
                  companionProfile?.setActiveProfileId(e.target.value);
                }}
                className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white border border-white/15 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Synchronisation...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" /> Synchronisé en direct !
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Enregistrer & Sync TV
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── BARRE D'ONGLETS THÉMATIQUES ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-white/[0.08]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === id
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40 gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Chargement des préférences du profil...</span>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ═════════════════════════════════════════════════════════════════
              TAB 1 : INTERFACE & THÈME TV (Blocs homogènes et bien proportionnés)
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "appearance" && (
            <div className="space-y-5">
              {/* Rangée 1 : 3 Blocs (Aperçu Live | Nuancier Focus | Horloge & Navigation) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Bloc 1 : Aperçu TV & Rendu D-Pad */}
                <SettingCard className="h-full flex flex-col justify-between">
                  <div>
                    <SectionTitle>Aperçu TV & Rendu Focus</SectionTitle>
                    <p className="text-xs text-white/50 mb-3">
                      Rendu live de l&apos;interface TV avec le thème et le focus actifs.
                    </p>
                    <ThemePreviewScreenMockup
                      mode={appBackgroundMode}
                      customArgb={appBackgroundCustomArgb}
                      focusHex={resolvedFocusHex}
                    />
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-white/60">
                    <span>Focus : <strong className="text-white">{useCustomColor ? focusCustomHex : focusBorderColor}</strong></span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0" style={{ backgroundColor: resolvedFocusHex }} />
                      {useCustomColor ? "Nuance perso" : "Préréglage"}
                    </span>
                  </div>
                </SettingCard>

                {/* Bloc 2 : Couleur de Focus D-Pad TV */}
                <SettingCard className="h-full flex flex-col justify-between">
                  <div>
                    <SectionTitle>Couleur de Focus D-Pad TV</SectionTitle>
                    <p className="text-xs text-white/50 mb-3.5">
                      Bordure lumineuse qui entoure l&apos;élément sélectionné à la télécommande.
                    </p>

                    {/* Grille 4x2 compacte */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5">
                      {PRESET_COLORS.map((c) => {
                        const isSelected = !useCustomColor && focusBorderColor.toLowerCase() === c.name.toLowerCase();
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setFocusBorderColor(c.name);
                              setUseCustomColor(false);
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-white bg-white/15 shadow-md shadow-white/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div
                              className="h-5 w-5 rounded-full border border-black/30 shadow-inner shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-xs text-white/90 font-medium truncate">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bouton Nuancier Personnalisé */}
                    <div className="pt-3 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setShowNuancier(!showNuancier)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          useCustomColor
                            ? "border-indigo-400 bg-indigo-500/20 text-white"
                            : "border-white/15 bg-white/5 text-white/70 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border border-white/30"
                            style={{
                              background: useCustomColor
                                ? focusCustomHex
                                : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                            }}
                          />
                          <span>{useCustomColor ? `Nuance (${focusCustomHex})` : "Palette de nuances"}</span>
                        </div>
                        <span className="text-[11px] text-white/40">{showNuancier ? "Masquer ▲" : "Choisir ▼"}</span>
                      </button>

                      {showNuancier && (
                        <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-white/10 space-y-2 animate-in fade-in duration-200">
                          <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
                            Palette de nuances précises
                          </p>
                          {NUANCIER_GRID.map((row, rIdx) => (
                            <div key={rIdx} className="flex justify-between gap-1.5">
                              {row.map((colorHex) => (
                                <button
                                  key={colorHex}
                                  type="button"
                                  onClick={() => {
                                    setFocusCustomHex(colorHex);
                                    setUseCustomColor(true);
                                  }}
                                  className="h-7 w-7 rounded-full border border-white/20 transition-transform hover:scale-110 flex items-center justify-center shrink-0 cursor-pointer"
                                  style={{ backgroundColor: colorHex }}
                                >
                                  {useCustomColor && focusCustomHex.toUpperCase() === colorHex.toUpperCase() && (
                                    <span className={`text-[10px] font-bold ${colorHex === "#FFFFFF" ? "text-black" : "text-white"}`}>
                                      ✓
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </SettingCard>

                {/* Bloc 3 : Horloge TV & Navigation */}
                <SettingCard className="h-full flex flex-col justify-between">
                  <div>
                    <SectionTitle>Horloge & Navigation</SectionTitle>
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-white block mb-1.5">Format de l&apos;horloge TV</span>
                      <div className="grid grid-cols-2 gap-2">
                        {["24h", "12h"].map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setClockFormat(fmt)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                              clockFormat === fmt
                                ? "border-indigo-400 bg-indigo-500/20 text-white"
                                : "border-white/10 text-white/50 hover:text-white/80"
                            }`}
                          >
                            {fmt === "24h" ? "24 Heures (14:30)" : "12 Heures (2:30 PM)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="divide-y divide-white/[0.06] pt-1 border-t border-white/[0.08]">
                      <ToggleRow
                        label="Sons de navigation TV"
                        sub="Bips sonores lors du clic D-pad à la télécommande"
                        checked={uiNavSoundsEnabled}
                        onChange={setUiNavSoundsEnabled}
                      />
                      <ToggleRow
                        label="Animation logo MegaTv"
                        sub="Joue l'intro au démarrage de l'app"
                        checked={megatvIntroAnimationEnabled}
                        onChange={setMegatvIntroAnimationEnabled}
                      />
                      <ToggleRow
                        label="Passer la sélection profil"
                        sub="Connexion directe au dernier profil actif"
                        checked={skipProfileSelection}
                        onChange={setSkipProfileSelection}
                      />
                    </div>
                  </div>
                </SettingCard>
              </div>

              {/* Rangée 2 : 2 Blocs Homogènes (Thème Arrière-plan | Écran d'accueil & Ambiances) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Bloc 4 : Thème d'arrière-plan TV */}
                <SettingCard>
                  <SectionTitle>Thème d&apos;arrière-plan TV</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Couleur d&apos;ambiance sur toute l&apos;application TV & Mobile.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    <button
                      type="button"
                      onClick={() => setAppBackgroundMode("original")}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        appBackgroundMode === "original"
                          ? "border-indigo-400 bg-indigo-500/15"
                          : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg border border-white/15 shrink-0 mt-0.5 bg-[#0D111A]" />
                      <div>
                        <span className="text-xs font-bold text-white block">Original Dark</span>
                        <span className="text-[10px] text-white/45">Fond sombre standard</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAppBackgroundMode("cover")}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        appBackgroundMode === "cover"
                          ? "border-indigo-400 bg-indigo-500/15"
                          : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg border border-white/15 shrink-0 mt-0.5 bg-gradient-to-br from-red-600 to-indigo-900" />
                      <div>
                        <span className="text-xs font-bold text-white block">Couverture profil</span>
                        <span className="text-[10px] text-white/45">Wash dynamique jaquette</span>
                      </div>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08]">
                    <p className="text-xs font-semibold text-white/70 mb-2">Nuances manuelles Android :</p>
                    <div className="grid grid-cols-3 gap-2">
                      {APP_BACKGROUND_SWATCHES.map((swatch) => {
                        const isSelected = appBackgroundMode === "custom" && appBackgroundCustomArgb === swatch.argb;
                        return (
                          <button
                            key={swatch.label}
                            type="button"
                            onClick={() => {
                              setAppBackgroundMode("custom");
                              setAppBackgroundCustomArgb(swatch.argb);
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-white bg-white/15 shadow-md shadow-white/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div
                              className="w-5 h-5 rounded-md border border-white/20 shrink-0 flex items-center justify-center text-[9px] text-white font-bold"
                              style={{ backgroundColor: swatch.hex }}
                            >
                              {isSelected && "✓"}
                            </div>
                            <span className="text-[11px] text-white/80 font-medium truncate">{swatch.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </SettingCard>

                {/* Bloc 5 : Écran de sélection & Ambiances */}
                <SettingCard>
                  <SectionTitle>Écran d&apos;accueil & Ambiances</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Animation de fond sur l&apos;écran « Qui regarde ? » et reflets immersifs.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { value: "glow", title: "Éclairé", desc: "Halo doux" },
                      { value: "wave", title: "Vague", desc: "Ondulation" },
                      { value: "continue_watching", title: "Reprises", desc: "Carrousel" },
                    ].map((bgOpt) => (
                      <button
                        key={bgOpt.value}
                        type="button"
                        onClick={() => setProfilePickerBackground(bgOpt.value)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          profilePickerBackground === bgOpt.value
                            ? "border-indigo-400 bg-indigo-500/15 shadow-md shadow-indigo-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{bgOpt.title}</span>
                        <span className="text-[10px] text-white/40">{bgOpt.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="divide-y divide-white/[0.06] pt-1 border-t border-white/[0.08]">
                    <ToggleRow
                      label="Couleurs d'ambiance (Fiches détails)"
                      sub="Arrière-plans adaptatifs colorés selon la jaquette du film"
                      checked={detailsAmbientColor}
                      onChange={setDetailsAmbientColor}
                    />
                    <ToggleRow
                      label="Ambiance sur l'écran profil"
                      sub="Teinte dynamique extraite de la photo de couverture"
                      checked={profileAmbientColor}
                      onChange={setProfileAmbientColor}
                    />
                  </div>
                </SettingCard>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 2 : POSTERS & ACCUEIL (Regroupé en 3 colonnes homogènes)
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "posters" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* COLONNE 1 : Format & Cadre */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Format & Courbure des affiches</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Présentation générale des affiches dans les grilles et carrousels.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {[
                      { value: "landscape", title: "Paysage 16:9", desc: "Format large streaming" },
                      { value: "portrait", title: "Portrait 2:3", desc: "Affiche cinéma classique" },
                    ].map((layout) => (
                      <button
                        key={layout.value}
                        type="button"
                        onClick={() => setCardLayoutMode(layout.value)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          cardLayoutMode === layout.value
                            ? "border-indigo-400 bg-indigo-500/15"
                            : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{layout.title}</span>
                        <span className="text-[10px] text-white/45 leading-tight">{layout.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Slider Rayon coins */}
                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/70 font-semibold">Rayon des coins :</span>
                      <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg text-xs">
                        {posterCardRadiusDp} dp {posterCardRadiusDp === 28 ? "(Défaut)" : ""}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      step="4"
                      value={posterCardRadiusDp}
                      onChange={(e) => setPosterCardRadiusDp(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-white/30 font-mono">
                      <span>0 dp</span>
                      <span>8 dp</span>
                      <span>16 dp</span>
                      <span>28 dp</span>
                      <span>32 dp</span>
                    </div>
                  </div>

                  {/* Cadre Focus */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-3">
                    <SectionTitle>Cadre Focus (Affiches & Acteurs)</SectionTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/80">Couleur du cadre :</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPosterFocusColorMode("profile")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            posterFocusColorMode !== "white"
                              ? "border-indigo-400 bg-indigo-500/20 text-white"
                              : "border-white/10 text-white/50"
                          }`}
                        >
                          Couleur profil
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosterFocusColorMode("white")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            posterFocusColorMode === "white"
                              ? "border-indigo-400 bg-indigo-500/20 text-white"
                              : "border-white/10 text-white/50"
                          }`}
                        >
                          Blanc
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/70 font-medium">Opacité du cadre focus :</span>
                        <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg text-xs">
                          {posterFocusAlpha}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="20"
                        value={posterFocusAlpha}
                        onChange={(e) => setPosterFocusAlpha(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-white/30 font-mono">
                        <span>20%</span>
                        <span>40%</span>
                        <span>60%</span>
                        <span>80%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingCard>

              {/* COLONNE 2 : Aperçu Live & Bannière */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Aperçu en direct (TV Focus)</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Rendu dynamique avec contour focus, étoiles et rayon configuré.
                  </p>
                  <div className="py-2 flex justify-center">
                    <PosterLivePreview
                      mode={cardLayoutMode}
                      radiusDp={posterCardRadiusDp}
                      focusColorMode={posterFocusColorMode}
                      focusAlpha={posterFocusAlpha}
                      resolvedFocusHex={resolvedFocusHex}
                    />
                  </div>
                </div>

                {/* Bannière profil */}
                <div className="pt-4 border-t border-white/[0.08]">
                  <SectionTitle>Photo de couverture (Bannière profil)</SectionTitle>
                  <p className="text-[11px] text-white/45 mb-2.5">
                    Image compressée automatiquement (max 960x540, auto ≤ 40 Ko).
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white cursor-pointer transition-all active:scale-95">
                      <Upload className="h-3.5 w-3.5" />
                      {coverUploading ? "Envoi..." : "Changer l'image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                        disabled={coverUploading}
                      />
                    </label>
                    {coverSynced && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Couverture synchronisée
                      </span>
                    )}
                  </div>
                </div>
              </SettingCard>

              {/* COLONNE 3 : Social, Anti-spoiler & Langues */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Social & Anti-spoiler</SectionTitle>
                  <div className="divide-y divide-white/[0.06]">
                    <ToggleRow
                      label="Flou anti-spoiler"
                      sub="Floute les vignettes d'épisodes non vus sur les fiches"
                      checked={spoilerBlurEnabled}
                      onChange={setSpoilerBlurEnabled}
                    />
                    <ToggleRow
                      label="Badge amis — En cours"
                      sub="Affiche la photo des amis qui regardent ce titre"
                      checked={posterFriendsWatching}
                      onChange={setPosterFriendsWatching}
                    />
                    <ToggleRow
                      label="Badge amis — Terminé"
                      sub="Affiche la photo des amis ayant terminé le titre"
                      checked={posterFriendsCompleted}
                      onChange={setPosterFriendsCompleted}
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3">
                    <SectionTitle>Langue & Métadonnées</SectionTitle>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-white block">Langue des affiches</span>
                        <span className="text-[10px] text-white/40">Priorité des visuels TMDB</span>
                      </div>
                      <select
                        value={posterArtLang}
                        onChange={(e) => setPosterArtLang(e.target.value)}
                        className="rounded-xl bg-neutral-900 border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none cursor-pointer"
                      >
                        <option value="fr">Français (fr)</option>
                        <option value="en">Anglais (en)</option>
                        <option value="original">Original</option>
                      </select>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                      <span>✓</span>
                      <span>Source officielle TMDB certifiée conforme TV</span>
                    </div>
                  </div>
                </div>
              </SettingCard>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 3 : LECTURE & CONTINUE WATCHING (3 Colonnes homogènes)
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "playback" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* COLONNE 1 : Continuer à regarder */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Continuer à regarder</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Présentation des cartes de reprise sur votre accueil.
                  </p>
                  <div className="space-y-2.5 mb-4">
                    {(["carte", "paysage", "poster"] as const).map((cwStyle) => (
                      <CwMockupPreview
                        key={cwStyle}
                        style={cwStyle}
                        selected={continueWatchingCardStyle === cwStyle}
                        onClick={() => setContinueWatchingCardStyle(cwStyle)}
                      />
                    ))}
                  </div>
                  <div className="pt-3 border-t border-white/[0.08]">
                    <ToggleRow
                      label="Préférer les vignettes d'épisode"
                      sub="Capture de scène plutôt que l'affiche globale de la série"
                      checked={cwPreferEpisodeThumbnail}
                      onChange={setCwPreferEpisodeThumbnail}
                    />
                  </div>
                </div>
              </SettingCard>

              {/* COLONNE 2 : Fiches Séries & Autoplay */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Cartes d&apos;épisodes (Fiche Série)</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Disposition des épisodes dans les fiches de séries.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <EpisodeCardStyleWireframe
                      styleKey="horizontal"
                      selected={episodeCardStyle === "horizontal"}
                      onClick={() => setEpisodeCardStyle("horizontal")}
                    />
                    <EpisodeCardStyleWireframe
                      styleKey="list"
                      selected={episodeCardStyle === "list"}
                      onClick={() => setEpisodeCardStyle("list")}
                    />
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] space-y-3">
                    <SectionTitle>Enchaînement automatique (Autoplay)</SectionTitle>
                    <div className="divide-y divide-white/[0.06]">
                      <ToggleRow
                        label="Épisode suivant automatique"
                        sub="Enchaîne directement l'épisode suivant"
                        checked={autoPlayNext}
                        onChange={setAutoPlayNext}
                      />
                      <ToggleRow
                        label="Lancer la source unique"
                        sub="Évite le menu de flux quand un seul existe"
                        checked={autoPlaySingleSource}
                        onChange={setAutoPlaySingleSource}
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-white block">Qualité minimale</span>
                        <span className="text-[10px] text-white/40">Filtre de résolution</span>
                      </div>
                      <select
                        value={autoPlayMinQuality}
                        onChange={(e) => setAutoPlayMinQuality(e.target.value)}
                        className="rounded-xl bg-neutral-900 border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Any">Toutes qualités</option>
                        <option value="1080p">1080p FHD min</option>
                        <option value="4K">4K UHD min</option>
                      </select>
                    </div>
                  </div>
                </div>
              </SettingCard>

              {/* COLONNE 3 : Bandes-annonces Hero TV */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Bandes-annonces Hero TV</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Comportement du teaser vidéo en haut de la page d&apos;accueil.
                  </p>
                  <div className="divide-y divide-white/[0.06] mb-4">
                    <ToggleRow
                      label="Lecture auto vidéo"
                      sub="Démarre après inactivité sur la fiche hero"
                      checked={trailerAutoPlay}
                      onChange={setTrailerAutoPlay}
                    />
                    <ToggleRow
                      label="Son de la bande-annonce"
                      sub="Active l'audio d'arrière-plan du teaser"
                      checked={trailerSoundEnabled}
                      onChange={setTrailerSoundEnabled}
                    />
                    <ToggleRow
                      label="Plein écran automatique"
                      sub="Agrandit automatiquement la vidéo"
                      checked={trailerFullscreenEnabled}
                      onChange={setTrailerFullscreenEnabled}
                    />
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70 font-medium">Délai démarrage vidéo :</span>
                        <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg text-xs">
                          {heroTrailerDelaySeconds} s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={heroTrailerDelaySeconds}
                        onChange={(e) => setHeroTrailerDelaySeconds(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70 font-medium">Délai avant plein écran :</span>
                        <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg text-xs">
                          {heroTrailerFullscreenDelaySeconds} s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="20"
                        value={heroTrailerFullscreenDelaySeconds}
                        onChange={(e) => setHeroTrailerFullscreenDelaySeconds(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </SettingCard>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 4 : SOUS-TITRES & AUDIO (Langues complètes + Choix Forced)
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "subtitles" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* COLONNE 1 : Audio & Sous-titres principaux */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Audio & Sous-titres principaux</SectionTitle>

                  {/* Piste Audio */}
                  <div className="mb-4">
                    <label className="text-xs text-white/60 block mb-1.5 font-semibold">Piste audio par défaut</label>
                    <select
                      value={defaultAudioLanguage}
                      onChange={(e) => setDefaultAudioLanguage(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {AUDIO_LANGUAGES.map((al) => (
                        <option key={al.value} value={al.value}>
                          {al.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sous-titres principaux */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-white/60 font-semibold">
                          Sous-titres principaux
                        </label>
                        {defaultSubLang !== "Off" && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            defaultSubForced ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}>
                            {defaultSubForced ? "Forcés uniquement" : "Complets"}
                          </span>
                        )}
                      </div>
                      <select
                        value={defaultSubLang}
                        onChange={(e) => {
                          const newLang = e.target.value;
                          setDefaultSubLang(newLang);
                          setDefaultSubtitle(formatSubtitleValue(newLang, defaultSubForced));
                        }}
                        className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {SUBTITLE_LANGUAGES.map((sl) => (
                          <option key={sl.value} value={sl.value}>
                            {sl.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Choix Forcé vs Complet */}
                    {defaultSubLang !== "Off" && (
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                        <span className="text-[11px] font-semibold text-white/70 block">
                          Type d&apos;affichage de la piste :
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDefaultSubForced(false);
                              setDefaultSubtitle(formatSubtitleValue(defaultSubLang, false));
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                              !defaultSubForced
                                ? "border-indigo-400 bg-indigo-500/20 text-white shadow-sm"
                                : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                            }`}
                          >
                            Complets
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDefaultSubForced(true);
                              setDefaultSubtitle(formatSubtitleValue(defaultSubLang, true));
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                              defaultSubForced
                                ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-sm"
                                : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                            }`}
                          >
                            Forcés (Forced) ✓
                          </button>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed pt-1">
                          {defaultSubForced
                            ? "⚡ Forcés : s'affiche uniquement lors des dialogues en langue étrangère non traduite."
                            : "Complets : sous-titres intégraux sur l'ensemble de la lecture."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </SettingCard>

              {/* COLONNE 2 : Sous-titres secondaires & Filtrage */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Sous-titres secondaires & Filtrage</SectionTitle>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-white/60 font-semibold">
                          Sous-titres secondaires (Secours)
                        </label>
                        {secondarySubLang !== "Off" && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            secondarySubForced ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}>
                            {secondarySubForced ? "Forcés" : "Complets"}
                          </span>
                        )}
                      </div>
                      <select
                        value={secondarySubLang}
                        onChange={(e) => {
                          const newLang = e.target.value;
                          setSecondarySubLang(newLang);
                          setSecondarySubtitle(formatSubtitleValue(newLang, secondarySubForced));
                        }}
                        className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {SUBTITLE_LANGUAGES.map((sl) => (
                          <option key={sl.value} value={sl.value}>
                            {sl.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Choix Forcé pour secondaires */}
                    {secondarySubLang !== "Off" && (
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                        <span className="text-[11px] font-semibold text-white/70 block">
                          Type de piste secondaire :
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSecondarySubForced(false);
                              setSecondarySubtitle(formatSubtitleValue(secondarySubLang, false));
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                              !secondarySubForced
                                ? "border-indigo-400 bg-indigo-500/20 text-white shadow-sm"
                                : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                            }`}
                          >
                            Complets
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSecondarySubForced(true);
                              setSecondarySubtitle(formatSubtitleValue(secondarySubLang, true));
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                              secondarySubForced
                                ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-sm"
                                : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                            }`}
                          >
                            Forcés (Forced) ✓
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] divide-y divide-white/[0.06]">
                    <ToggleRow
                      label="Filtrer les pistes par langue"
                      sub="Masque les langues secondaires non configurées"
                      checked={filterSubtitlesByLanguage}
                      onChange={setFilterSubtitlesByLanguage}
                    />
                    <ToggleRow
                      label="Sous-titres stylisés"
                      sub="Contours renforcés et ombres portées pour une lisibilité maximale"
                      checked={subtitleStylized}
                      onChange={setSubtitleStylized}
                    />
                  </div>
                </div>
              </SettingCard>

              {/* COLONNE 3 : Typographie & Aperçu Live */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Typographie & Rendu en direct</SectionTitle>

                  {/* Aperçu en direct */}
                  <div className="rounded-xl bg-black/90 border border-white/10 p-4 flex items-center justify-center min-h-[75px] mb-4">
                    <p
                      className="text-center leading-tight transition-all duration-200"
                      style={{
                        fontSize:
                          subtitleSize === "Small"
                            ? "12px"
                            : subtitleSize === "Large"
                            ? "18px"
                            : subtitleSize === "Extra Large"
                            ? "22px"
                            : "15px",
                        fontWeight: subtitleStyle === "Bold" ? 700 : 400,
                        color:
                          subtitleColor === "Yellow"
                            ? "#FFDD44"
                            : subtitleColor === "Green"
                            ? "#1DB954"
                            : subtitleColor === "Cyan"
                            ? "#06B6D4"
                            : "#FFFFFF",
                        backgroundColor: subtitleStyle === "Background" ? "rgba(0,0,0,0.75)" : "transparent",
                        padding: subtitleStyle === "Background" ? "4px 8px" : "0",
                        borderRadius: "4px",
                        textShadow: subtitleStylized ? "0 2px 4px rgba(0,0,0,0.9)" : "none",
                      }}
                    >
                      Exemple de sous-titre affiché à l&apos;écran
                    </p>
                  </div>

                  {/* 4 Sélecteurs Typo */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1 font-semibold">Taille</label>
                      <select
                        value={subtitleSize}
                        onChange={(e) => setSubtitleSize(e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Small">Petit</option>
                        <option value="Medium">Moyen (Défaut)</option>
                        <option value="Large">Grand</option>
                        <option value="Extra Large">Très grand</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-white/50 block mb-1 font-semibold">Couleur</label>
                      <select
                        value={subtitleColor}
                        onChange={(e) => setSubtitleColor(e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none cursor-pointer"
                      >
                        <option value="White">Blanc</option>
                        <option value="Yellow">Jaune</option>
                        <option value="Green">Vert</option>
                        <option value="Cyan">Cyan</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-white/50 block mb-1 font-semibold">Style</label>
                      <select
                        value={subtitleStyle}
                        onChange={(e) => setSubtitleStyle(e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Bold">Gras</option>
                        <option value="Normal">Normal</option>
                        <option value="Background">Fond sombre</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-white/50 block mb-1 font-semibold">Position</label>
                      <select
                        value={subtitleOffset}
                        onChange={(e) => setSubtitleOffset(e.target.value)}
                        className="w-full rounded-xl bg-neutral-900 border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Bottom">Bas (Défaut)</option>
                        <option value="Low">Surélevé</option>
                        <option value="Medium">Moyen</option>
                        <option value="High">Haut</option>
                      </select>
                    </div>
                  </div>
                </div>
              </SettingCard>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 5 : ERGONOMIE MOBILE (2 Blocs bien équilibrés)
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "mobile" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Bloc 1 : Barre de navigation */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Style de la barre de navigation mobile</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Choisissez l&apos;ergonomie de votre dock flottant sur smartphone et tablette.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {(["separated", "grouped", "classic"] as const).map((sKey) => (
                      <MobileNavPhoneWireframe
                        key={sKey}
                        styleKey={sKey}
                        selected={mobileNavBarStyle === sKey}
                        glowEnabled={mobileNavGlowEnabled}
                        onClick={() => setMobileNavBarStyle(sKey)}
                      />
                    ))}
                  </div>
                  <div className="pt-3 border-t border-white/[0.08]">
                    <ToggleRow
                      label="Effet Glow (Lueur lumineuse)"
                      sub="Lueur lumineuse douce sous la barre de navigation"
                      checked={mobileNavGlowEnabled}
                      onChange={setMobileNavGlowEnabled}
                    />
                  </div>
                </div>
              </SettingCard>

              {/* Bloc 2 : Isolation & Matériel */}
              <SettingCard className="h-full flex flex-col justify-between">
                <div>
                  <SectionTitle>Isolation matérielle & Synchronisation</SectionTitle>
                  <p className="text-xs text-white/50 mb-3">
                    Gestion multi-écrans et sécurité des paramètres matériels.
                  </p>
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 mb-4">
                    <ShieldAlert className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-200/80 leading-relaxed">
                      <span className="font-semibold text-white block mb-0.5">Isolation matérielle (Per-Device) active :</span>
                      Les réglages physiques locaux (taux de rafraîchissement AFR, lecteur externe, amplification sonore locale et résolveurs DNS) ne sont pas écrasés par la synchronisation cloud et restent adaptés à chaque écran.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/60">
                    <span className="font-semibold text-white block mb-1">Synchronisation instantanée</span>
                    Vos choix d&apos;interface, d&apos;affiches et de préférences de sous-titres sont instantanément répercutés dès que vous cliquez sur <strong className="text-white">Enregistrer & Sync TV</strong>.
                  </div>
                </div>
              </SettingCard>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
