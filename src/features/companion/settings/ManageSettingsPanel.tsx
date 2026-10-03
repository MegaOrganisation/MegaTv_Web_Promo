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

const NUANCIER_GRID = [
  ["#FFFFFF", "#E2E8F0", "#94A3B8", "#64748B", "#334155", "#1E293B"],
  ["#EF4444", "#DC2626", "#B91C1C", "#F87171", "#FB7185", "#E11D48"],
  ["#F97316", "#EA580C", "#F59E0B", "#D97706", "#EAB308", "#CA8A04"],
  ["#22C55E", "#16A34AL", "#10B981", "#059669", "#14B8A6", "#0D9488"],
  ["#06B6D4", "#0891B2", "#0EA5E9", "#0284C7", "#3B82F6", "#2563EB"],
  ["#6366F1", "#4F46E5", "#8B5CF6", "#7C3AED", "#A855F7", "#EC4899"],
];

const POSTER_PREVIEW_POSTER_URL = "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg";
const POSTER_PREVIEW_BACKDROP_URL = "https://image.tmdb.org/t/p/w780/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg";

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
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/45 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
      {children}
    </h3>
  );
}

function SettingCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4.5 sm:p-5 backdrop-blur-md ${className}`}>
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
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{label}</p>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
      </div>
      <div
        className={`w-11 h-6 rounded-full transition-all duration-200 relative shrink-0 ${
          checked ? "bg-indigo-500 shadow-sm shadow-indigo-500/50" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
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

/** 1. ThemePreviewScreenMockup (Identique au mockup TV Bezel de l'application) */
function ThemePreviewScreenMockup({
  mode,
  focusHex,
}: {
  mode: string;
  focusHex: string;
}) {
  const isOled = mode === "oled_black";
  const bg = isOled ? "#000000" : "#0D111A";

  return (
    <div className="flex flex-col items-center max-w-[340px] w-full mx-auto">
      {/* Cadre Bezel Moniteur TV */}
      <div
        className="w-full rounded-2xl p-1.5 shadow-2xl transition-all duration-300"
        style={{
          background: "linear-gradient(to bottom, #162132, #0A0F18)",
          border: "1.5px solid #334560",
          boxShadow: `0 8px 24px ${focusHex}26`,
        }}
      >
        {/* Écran TV Intérieur */}
        <div
          className="w-full h-36 rounded-xl p-2.5 flex flex-col justify-between border border-white/10 overflow-hidden transition-colors duration-300"
          style={{ background: bg }}
        >
          {/* Top Bar Capsule */}
          <div className="flex items-center justify-between rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-1.5">
              {/* Onglet Accueil sélectionné avec couleur focus */}
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
          <div className="w-full h-12 rounded-lg bg-gradient-to-r from-white/10 to-transparent border border-white/10 p-2 flex flex-col justify-center">
            <div className="h-1.5 w-16 bg-white/90 rounded mb-1" />
            <div className="h-1 w-24 bg-white/40 rounded" />
          </div>

          {/* Rangée de Miniatures en bas */}
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 rounded bg-neutral-800/80 border transition-all"
                style={{
                  borderColor: i === 0 ? focusHex : "rgba(255,255,255,0.08)",
                  boxShadow: i === 0 ? `0 0 6px ${focusHex}88` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-white/70 mt-2">Aperçu TV & Focus D-Pad</span>
      <span className="text-[10px] text-white/40">{isOled ? "OLED Noir Absolu (#000000)" : "Dark Standard (#0D111A)"}</span>
    </div>
  );
}

/** 2. PosterLivePreview (Identique à PreviewPosterCard d'Android avec étoiles 5 branches) */
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
        {/* Conteneur Image avec rayon configuré */}
        <div
          className="relative overflow-hidden bg-neutral-900 transition-all duration-200"
          style={{
            width: isLandscape ? 200 : 120,
            height: isLandscape ? 112 : 180,
            borderRadius: `${radiusDp}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Poster preview"
            className="w-full h-full object-cover"
          />

          {/* Badges Amis en haut à gauche */}
          <div className="absolute top-2 left-2 flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500 border border-black text-[9px] flex items-center justify-center font-bold text-white shadow">
              S
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-500 border border-black text-[9px] flex items-center justify-center font-bold text-white shadow">
              C
            </div>
          </div>
        </div>

        {/* Rangée d'étoiles FocusStarRatingRow (Identique à Android TV Focus) */}
        <div
          className="flex items-center justify-center gap-1 mt-1 mb-0.5"
          style={{ width: isLandscape ? 200 : 120, height: "18px" }}
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
        <span className="text-[11px] text-emerald-400 font-medium">Source : TMDB Officiel</span>
      </div>
    </div>
  );
}

/** 3. CwMockupPreview (Identique à CwStyleSelectorCard d'Android) */
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
      className={`flex-1 rounded-2xl p-3 border transition-all text-left flex flex-col justify-between ${
        selected
          ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      {/* Aperçu Miniature Wireframe fidèle */}
      <div className="h-16 w-full rounded-xl bg-neutral-900 border border-white/10 p-2 flex items-center justify-center mb-2 overflow-hidden">
        {style === "carte" && (
          <div className="w-full flex items-center gap-2">
            <div className="w-9 h-12 rounded bg-neutral-700 shrink-0 border border-white/15" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-white/80" />
              <div className="h-1.5 w-1/2 rounded bg-white/40" />
              <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-2/3 bg-red-500" />
              </div>
            </div>
          </div>
        )}

        {style === "paysage" && (
          <div className="w-full h-12 rounded-lg bg-neutral-800 border border-white/15 p-1.5 flex flex-col justify-between">
            <div className="flex justify-end">
              <span className="text-[8px] px-1 rounded bg-black/60 text-white/60">Ép. 4</span>
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
          <div className="w-8 h-12 rounded bg-neutral-800 border border-white/15 p-1 flex flex-col justify-end">
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

/** 4. MobileNavPhoneWireframe (Identique à NavBarPhoneWireframe d'Android) */
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
      className={`flex-1 rounded-2xl p-3 border transition-all flex flex-col items-center gap-2.5 ${
        selected
          ? "border-white bg-white/10 shadow-lg shadow-indigo-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      {/* Silhouette Téléphone avec Dynamic Island */}
      <div className="w-20 h-28 rounded-xl bg-neutral-950 border border-white/20 p-1.5 flex flex-col justify-between relative overflow-hidden">
        {/* Dynamic Island */}
        <div className="w-6 h-1 rounded-full bg-white/30 mx-auto" />

        {/* Lignes de contenu factice */}
        <div className="space-y-1 my-auto">
          <div className="h-1 w-8 rounded bg-white/20" />
          <div className="h-6 w-full rounded bg-white/5 border border-white/10" />
          <div className="h-1 w-12 rounded bg-white/15" />
        </div>

        {/* Barre de navigation selon le style */}
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
        <span className="text-xs font-semibold text-white">{titles[styleKey]}</span>
        <div
          className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${
            selected ? "border-white" : "border-white/30"
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

/** 5. EpisodeCardStyleWireframe (Identique à EpisodeCardPhoneWireframe d'Android) */
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
      className={`flex-1 rounded-2xl p-3 border transition-all flex flex-col items-center gap-2.5 ${
        selected
          ? "border-white bg-white/10 shadow-lg shadow-indigo-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="w-24 h-32 rounded-xl bg-neutral-950 border border-white/20 p-2 flex flex-col justify-between">
        <div className="w-7 h-1 rounded-full bg-white/30 mx-auto" />

        {styleKey === "horizontal" ? (
          <div className="space-y-2 my-auto">
            <div className="w-full h-8 rounded bg-white/15 border border-white/10" />
            <div className="w-full h-8 rounded bg-white/15 border border-white/10" />
          </div>
        ) : (
          <div className="space-y-1.5 my-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-5 h-4 rounded bg-white/20 shrink-0" />
                <div className="space-y-0.5 flex-1">
                  <div className="h-1 w-full bg-white/40 rounded" />
                  <div className="h-1 w-2/3 bg-white/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-1.5 w-full bg-white/10 rounded" />
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold text-white">
          {styleKey === "horizontal" ? "Horizontal (Grille)" : "Liste compacte"}
        </span>
        <div
          className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${
            selected ? "border-white" : "border-white/30"
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
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
  const [appBackgroundMode, setAppBackgroundMode] = useState("original");
  const [profilePickerBackground, setProfilePickerBackground] = useState("glow");
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

  // 4. Sous-titres & Audio
  const [defaultAudioLanguage, setDefaultAudioLanguage] = useState("auto");
  const [defaultSubtitle, setDefaultSubtitle] = useState("Off");
  const [secondarySubtitle, setSecondarySubtitle] = useState("Off");
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
        if (s.app_background_mode) setAppBackgroundMode(s.app_background_mode);
        if (s.profile_picker_background) setProfilePickerBackground(s.profile_picker_background);
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
        if (s.default_subtitle) setDefaultSubtitle(s.default_subtitle);
        if (s.secondary_subtitle) setSecondarySubtitle(s.secondary_subtitle);
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

    try {
      const res = await fetch("/api/companion/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfileId,
          settings: {
            focus_border_color: useCustomColor ? focusCustomHex : focusBorderColor,
            app_background_mode: appBackgroundMode,
            oled_black_background: appBackgroundMode === "oled_black",
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
            default_subtitle: defaultSubtitle,
            secondary_subtitle: secondarySubtitle,
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

  /* ── Téléversement bannière profil (< 40 Ko) ── */
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
                className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white border border-white/15 focus:outline-none focus:border-indigo-500"
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
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25"
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
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
              TAB 1 : INTERFACE & THÈME TV
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              {/* Mockup écran TV en haut de section (comme Android PJ 1) */}
              <SettingCard>
                <ThemePreviewScreenMockup mode={appBackgroundMode} focusHex={resolvedFocusHex} />
              </SettingCard>

              {/* Couleur de Focus D-Pad TV avec Nuancier Android */}
              <SettingCard>
                <SectionTitle>Couleur de Focus D-Pad TV</SectionTitle>
                <p className="text-xs text-white/50 mb-4">
                  Bordure lumineuse qui entoure l&apos;élément sélectionné à la télécommande.
                </p>

                {/* Grille presets */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-4">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setFocusBorderColor(c.name);
                        setUseCustomColor(false);
                      }}
                      className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${
                        !useCustomColor && focusBorderColor.toLowerCase() === c.name.toLowerCase()
                          ? "border-white bg-white/15 scale-105 shadow-md shadow-white/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className="h-7 w-7 rounded-full border border-black/30 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] text-white/80 font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>

                {/* Bouton Nuancier Personnalisé (Matrix Palette) */}
                <div className="pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowNuancier(!showNuancier)}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        useCustomColor
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/15 bg-white/5 text-white/70 hover:text-white"
                      }`}
                    >
                      <div
                        className="h-4 w-4 rounded-full border border-white/30"
                        style={{
                          background: useCustomColor
                            ? focusCustomHex
                            : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                        }}
                      />
                      {useCustomColor ? `Couleur personnalisée (${focusCustomHex})` : "Choisir une nuance personnalisée"}
                    </button>
                    {useCustomColor && (
                      <span className="text-xs font-mono text-indigo-400">{focusCustomHex}</span>
                    )}
                  </div>

                  {/* Nuancier Matrix 6x6 comme ColorNuancierDialog d'Android */}
                  {showNuancier && (
                    <div className="mt-4 p-4 rounded-xl bg-neutral-900 border border-white/10 space-y-2 animate-in fade-in duration-200">
                      <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                        Palette de nuances précises
                      </p>
                      {NUANCIER_GRID.map((row, rIdx) => (
                        <div key={rIdx} className="flex justify-between gap-2">
                          {row.map((colorHex) => (
                            <button
                              key={colorHex}
                              type="button"
                              onClick={() => {
                                setFocusCustomHex(colorHex);
                                setUseCustomColor(true);
                              }}
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-white/20 transition-transform hover:scale-110 flex items-center justify-center"
                              style={{ backgroundColor: colorHex }}
                            >
                              {useCustomColor && focusCustomHex.toUpperCase() === colorHex.toUpperCase() && (
                                <span className={`text-xs font-bold ${colorHex === "#FFFFFF" ? "text-black" : "text-white"}`}>
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
              </SettingCard>

              {/* Thème d'arrière-plan TV */}
              <SettingCard>
                <SectionTitle>Thème d&apos;arrière-plan TV</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: "original", title: "Original Dark (#0D111A)", desc: "Fond sombre sur mesure sobre et élégant" },
                    { value: "oled_black", title: "OLED Noir Absolu (#000000)", desc: "Pixels éteints pour écrans OLED et AMOLED" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAppBackgroundMode(opt.value)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        appBackgroundMode === opt.value
                          ? "border-indigo-400 bg-indigo-500/15"
                          : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg border border-white/15 shrink-0 mt-0.5"
                        style={{ backgroundColor: opt.value === "oled_black" ? "#000000" : "#0D111A" }}
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">{opt.title}</span>
                        <span className="text-[11px] text-white/45">{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </SettingCard>

              {/* Écran de sélection de profil */}
              <SettingCard>
                <SectionTitle>Écran de sélection de profil TV</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: "glow", title: "Halo lumineux (Glow)", desc: "Ambiance lumineuse douce et épurée" },
                    { value: "illuminated", title: "Illumination douce", desc: "Éclairage diffus sur les cartes profils" },
                  ].map((bgOpt) => (
                    <button
                      key={bgOpt.value}
                      type="button"
                      onClick={() => setProfilePickerBackground(bgOpt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        profilePickerBackground === bgOpt.value
                          ? "border-indigo-400 bg-indigo-500/15"
                          : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">{bgOpt.title}</span>
                      <span className="text-[11px] text-white/45">{bgOpt.desc}</span>
                    </button>
                  ))}
                </div>
              </SettingCard>

              {/* Options d'ambiance, audio navigation et horloge */}
              <SettingCard>
                <SectionTitle>Comportements & Ambiance</SectionTitle>
                <div className="divide-y divide-white/[0.06]">
                  <ToggleRow
                    label="Couleurs d'ambiance (Fiches détails)"
                    sub="Arrière-plans adaptatifs colorés selon la jaquette du film"
                    checked={detailsAmbientColor}
                    onChange={setDetailsAmbientColor}
                  />
                  <ToggleRow
                    label="Ambiance sur l'écran profil"
                    sub="Teinte dynamique issue de la photo de couverture"
                    checked={profileAmbientColor}
                    onChange={setProfileAmbientColor}
                  />
                  <ToggleRow
                    label="Animation d'introduction MegaTv"
                    sub="Joue l'animation logo MegaTv au lancement"
                    checked={megatvIntroAnimationEnabled}
                    onChange={setMegatvIntroAnimationEnabled}
                  />
                  <ToggleRow
                    label="Sons de navigation TV"
                    sub="Bips sonores lors du clic D-pad à la télécommande"
                    checked={uiNavSoundsEnabled}
                    onChange={setUiNavSoundsEnabled}
                  />
                  <ToggleRow
                    label="Passer la sélection de profil"
                    sub="Connexion directe au dernier profil sans écran d'accueil"
                    checked={skipProfileSelection}
                    onChange={setSkipProfileSelection}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Format de l&apos;horloge TV</span>
                    <span className="text-xs text-white/40">Affichage de l&apos;heure en haut à droite</span>
                  </div>
                  <div className="flex gap-2">
                    {["24h", "12h"].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setClockFormat(fmt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          clockFormat === fmt
                            ? "border-indigo-400 bg-indigo-500/20 text-white"
                            : "border-white/10 text-white/50"
                        }`}
                      >
                        {fmt === "24h" ? "24 Heures (14:30)" : "12 Heures (2:30 PM)"}
                      </button>
                    ))}
                  </div>
                </div>
              </SettingCard>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 2 : POSTERS & ACCUEIL
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "posters" && (
            <div className="space-y-6">
              {/* Galerie d'aperçu live poster (comme Android PosterLivePreviewGallery) */}
              <SettingCard>
                <PosterLivePreview
                  mode={cardLayoutMode}
                  radiusDp={posterCardRadiusDp}
                  focusColorMode={posterFocusColorMode}
                  focusAlpha={posterFocusAlpha}
                  resolvedFocusHex={resolvedFocusHex}
                />
              </SettingCard>

              {/* Format & Rayon des affiches */}
              <SettingCard>
                <SectionTitle>Format & Courbure des affiches</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { value: "landscape", title: "Paysage 16:9", desc: "Format large moderne type streaming" },
                    { value: "portrait", title: "Portrait 2:3", desc: "Affiche cinéma verticale classique" },
                  ].map((layout) => (
                    <button
                      key={layout.value}
                      type="button"
                      onClick={() => setCardLayoutMode(layout.value)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        cardLayoutMode === layout.value
                          ? "border-indigo-400 bg-indigo-500/15"
                          : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">{layout.title}</span>
                      <span className="text-[11px] text-white/45">{layout.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Slider rayon coins (0 à 32 dp par pas de 4) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70 font-semibold">Rayon des coins :</span>
                    <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg">
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
                    <span>0 dp (Carré)</span>
                    <span>8 dp</span>
                    <span>16 dp</span>
                    <span>28 dp</span>
                    <span>32 dp (Rond)</span>
                  </div>
                </div>
              </SettingCard>

              {/* Cadre Focus d'affiche (Couleur & Opacité Android) */}
              <SettingCard>
                <SectionTitle>Cadre Focus (Affiches & Acteurs)</SectionTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-white block">Couleur du cadre</span>
                      <span className="text-xs text-white/40">
                        {posterFocusColorMode === "white" ? "Blanc classique" : "Couleur du profil"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPosterFocusColorMode("profile")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          posterFocusColorMode === "white"
                            ? "border-indigo-400 bg-indigo-500/20 text-white"
                            : "border-white/10 text-white/50"
                        }`}
                      >
                        Blanc
                      </button>
                    </div>
                  </div>

                  {/* Transparence du cadre (20, 40, 60, 80, 100%) */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/70 font-semibold">Opacité du cadre focus :</span>
                      <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg">
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
                      <span>20% (Subtil)</span>
                      <span>40%</span>
                      <span>60%</span>
                      <span>80%</span>
                      <span>100% (Solide)</span>
                    </div>
                  </div>
                </div>
              </SettingCard>

              {/* Anti-spoiler & Badges Amis */}
              <SettingCard>
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
                    sub="Affiche la photo des amis ayant terminé le film ou la série"
                    checked={posterFriendsCompleted}
                    onChange={setPosterFriendsCompleted}
                  />
                </div>
              </SettingCard>

              {/* Photo de couverture du profil (< 40 Ko vers Supabase Storage) */}
              <SettingCard>
                <SectionTitle>Photo de couverture (Bannière profil)</SectionTitle>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white cursor-pointer transition-all active:scale-95">
                    <Upload className="h-4 w-4" />
                    {coverUploading ? "Compression & Envoi..." : "Changer l'image (auto ≤ 40 Ko)"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                      disabled={coverUploading}
                    />
                  </label>
                  {coverSynced && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Couverture synchronisée
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/40 mt-2">
                  L&apos;image est automatiquement compressée côté navigateur (max 960x540) avant stockage pour préserver votre base.
                </p>
              </SettingCard>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 3 : LECTURE & CONTINUE WATCHING
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "playback" && (
            <div className="space-y-6">
              {/* Style des cartes Continue Watching avec aperçus réels */}
              <SettingCard>
                <SectionTitle>Style des cartes Continuer à regarder</SectionTitle>
                <p className="text-xs text-white/50 mb-3">
                  Choisissez la présentation des cartes de reprise sur votre accueil.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["carte", "paysage", "poster"] as const).map((cwStyle) => (
                    <CwMockupPreview
                      key={cwStyle}
                      style={cwStyle}
                      selected={continueWatchingCardStyle === cwStyle}
                      onClick={() => setContinueWatchingCardStyle(cwStyle)}
                    />
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <ToggleRow
                    label="Préférer les vignettes d'épisode"
                    sub="Affiche la capture de la scène plutôt que l'affiche globale de la série"
                    checked={cwPreferEpisodeThumbnail}
                    onChange={setCwPreferEpisodeThumbnail}
                  />
                </div>
              </SettingCard>

              {/* Style des cartes d'épisodes (Horizontal vs Liste) */}
              <SettingCard>
                <SectionTitle>Style des cartes d&apos;épisodes (Fiche Série)</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </SettingCard>

              {/* Enchaînement & Autoplay */}
              <SettingCard>
                <SectionTitle>Enchaînement automatique (Autoplay)</SectionTitle>
                <div className="divide-y divide-white/[0.06]">
                  <ToggleRow
                    label="Épisode suivant automatique"
                    sub="Enchaîne directement l'épisode suivant sans repasser par le menu"
                    checked={autoPlayNext}
                    onChange={setAutoPlayNext}
                  />
                  <ToggleRow
                    label="Lancer la source unique directement"
                    sub="Évite le panneau de sélection de flux lorsqu'une seule source est détectée"
                    checked={autoPlaySingleSource}
                    onChange={setAutoPlaySingleSource}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Qualité minimale pour l&apos;Autoplay</span>
                    <span className="text-xs text-white/40">Filtre de résolution de lecture automatique</span>
                  </div>
                  <select
                    value={autoPlayMinQuality}
                    onChange={(e) => setAutoPlayMinQuality(e.target.value)}
                    className="rounded-xl bg-neutral-900 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="Any">Toutes qualités acceptées</option>
                    <option value="1080p">1080p FHD minimum</option>
                    <option value="4K">4K UHD minimum</option>
                  </select>
                </div>
              </SettingCard>

              {/* Bandes-annonces Hero TV */}
              <SettingCard>
                <SectionTitle>Bandes-annonces à l&apos;accueil (Hero TV)</SectionTitle>
                <div className="divide-y divide-white/[0.06]">
                  <ToggleRow
                    label="Lecture automatique de la bande-annonce"
                    sub="Démarre la vidéo en haut de la page d'accueil après inactivité"
                    checked={trailerAutoPlay}
                    onChange={setTrailerAutoPlay}
                  />
                  <ToggleRow
                    label="Son de la bande-annonce"
                    sub="Active l'audio d'arrière-plan de la vidéo"
                    checked={trailerSoundEnabled}
                    onChange={setTrailerSoundEnabled}
                  />
                  <ToggleRow
                    label="Plein écran automatique"
                    sub="Agrandit automatiquement la vidéo en plein écran"
                    checked={trailerFullscreenEnabled}
                    onChange={setTrailerFullscreenEnabled}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70 font-semibold">Délai avant démarrage vidéo :</span>
                      <span className="font-mono text-indigo-400">{heroTrailerDelaySeconds} s</span>
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

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70 font-semibold">Délai avant plein écran :</span>
                      <span className="font-mono text-indigo-400">{heroTrailerFullscreenDelaySeconds} s</span>
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
              </SettingCard>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 4 : SOUS-TITRES & AUDIO
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "subtitles" && (
            <div className="space-y-6">
              {/* Sélecteurs de langues par défaut */}
              <SettingCard>
                <SectionTitle>Pistes audio et sous-titres par défaut</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-white/50 block mb-1.5 font-semibold">Piste audio</label>
                    <select
                      value={defaultAudioLanguage}
                      onChange={(e) => setDefaultAudioLanguage(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none"
                    >
                      <option value="auto">Automatique (Original)</option>
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 block mb-1.5 font-semibold">Sous-titres principaux</label>
                    <select
                      value={defaultSubtitle}
                      onChange={(e) => setDefaultSubtitle(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none"
                    >
                      <option value="Off">Désactivés</option>
                      <option value="French">Français</option>
                      <option value="English">Anglais</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 block mb-1.5 font-semibold">Sous-titres secondaires</label>
                    <select
                      value={secondarySubtitle}
                      onChange={(e) => setSecondarySubtitle(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none"
                    >
                      <option value="Off">Désactivés</option>
                      <option value="English">Anglais</option>
                      <option value="French">Français</option>
                    </select>
                  </div>
                </div>
              </SettingCard>

              {/* Rendu visuel & typographie des sous-titres */}
              <SettingCard>
                <SectionTitle>Apparence & Typographie du texte</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-white/50 block mb-1.5 font-semibold">Taille</label>
                    <select
                      value={subtitleSize}
                      onChange={(e) => setSubtitleSize(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none"
                    >
                      <option value="Small">Petit</option>
                      <option value="Medium">Moyen (Défaut)</option>
                      <option value="Large">Grand</option>
                      <option value="Extra Large">Très grand</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 block mb-1.5 font-semibold">Couleur</label>
                    <select
                      value={subtitleColor}
                      onChange={(e) => setSubtitleColor(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none"
                    >
                      <option value="White">Blanc</option>
                      <option value="Yellow">Jaune</option>
                      <option value="Green">Vert</option>
                      <option value="Cyan">Cyan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 block mb-1.5 font-semibold">Style</label>
                    <select
                      value={subtitleStyle}
                      onChange={(e) => setSubtitleStyle(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none"
                    >
                      <option value="Bold">Gras</option>
                      <option value="Normal">Normal</option>
                      <option value="Background">Avec fond sombre</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 block mb-1.5 font-semibold">Position</label>
                    <select
                      value={subtitleOffset}
                      onChange={(e) => setSubtitleOffset(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none"
                    >
                      <option value="Bottom">Bas (par défaut)</option>
                      <option value="Low">Légèrement surélevé</option>
                      <option value="Medium">Moyen</option>
                      <option value="High">Haut</option>
                    </select>
                  </div>
                </div>

                {/* Boîte d'aperçu en direct du sous-titre */}
                <div className="rounded-xl bg-black/80 border border-white/10 p-5 flex items-center justify-center min-h-[70px] mb-4">
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
                      backgroundColor: subtitleStyle === "Background" ? "rgba(0,0,0,0.7)" : "transparent",
                      padding: subtitleStyle === "Background" ? "4px 8px" : "0",
                      borderRadius: "4px",
                      textShadow: subtitleStylized ? "0 2px 4px rgba(0,0,0,0.9)" : "none",
                    }}
                  >
                    Exemple de réplique affichée à l&apos;écran
                  </p>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  <ToggleRow
                    label="Sous-titres stylisés"
                    sub="Ombres portées et contours renforcés pour une lisibilité optimale"
                    checked={subtitleStylized}
                    onChange={setSubtitleStylized}
                  />
                  <ToggleRow
                    label="Filtrer les pistes par langue"
                    sub="Masque les langues secondaires non prioritaires"
                    checked={filterSubtitlesByLanguage}
                    onChange={setFilterSubtitlesByLanguage}
                  />
                </div>
              </SettingCard>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              TAB 5 : ERGONOMIE MOBILE
             ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "mobile" && (
            <div className="space-y-6">
              {/* Wireframe Phone Cards côte à côte pour le style de la nav bar (PJ 2 Android) */}
              <SettingCard>
                <SectionTitle>Style de la barre de navigation mobile</SectionTitle>
                <p className="text-xs text-white/50 mb-3">
                  Choisissez l&apos;ergonomie de votre dock flottant sur smartphone et tablette.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <ToggleRow
                    label="Effet Glow (Lueur lumineuse)"
                    sub="Affiche une lueur lumineuse subtile sous la barre de navigation"
                    checked={mobileNavGlowEnabled}
                    onChange={setMobileNavGlowEnabled}
                  />
                </div>
              </SettingCard>

              {/* Rappel d'isolation Per-Device */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200/80 leading-relaxed">
                  <span className="font-semibold text-white block mb-0.5">Isolation matérielle (Per-Device) active :</span>
                  Les réglages matériels locaux (taux de rafraîchissement AFR, lecteur externe, amplification sonore locale et résolveurs DNS) demeurent spécifiques à chaque écran physique pour assurer une compatibilité optimale.
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
