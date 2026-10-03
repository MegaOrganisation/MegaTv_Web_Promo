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

/* ─── Données ─────────────────────────────────────────────────────────────── */

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

const TABS = [
  { id: "appearance", label: "Interface & Thème",        icon: Palette     },
  { id: "posters",    label: "Posters & Accueil",        icon: Film        },
  { id: "playback",   label: "Lecture & CW",             icon: PlaySquare  },
  { id: "subtitles",  label: "Sous-titres & Audio",      icon: Volume2     },
  { id: "mobile",     label: "Mobile",                   icon: Smartphone  },
] as const;

type TabId = typeof TABS[number]["id"];

/* ─── Composants visuels ───────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
      {children}
    </h3>
  );
}

function SettingCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4 ${className}`}>
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
    <label className="flex items-center justify-between gap-3 cursor-pointer py-2 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{label}</p>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
      </div>
      <div
        className={`w-10 h-6 rounded-full transition-all duration-200 relative shrink-0 ${
          checked ? "bg-indigo-500" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
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

function SegmentControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-2 px-3 text-xs font-medium transition-all ${
            value === o.value
              ? "bg-indigo-500 text-white shadow-sm"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Aperçu Poster ──────────────────────────────────────────────────────── */
function PosterPreview({
  mode,
  radius,
  focusHex,
}: {
  mode: string;
  radius: number;
  focusHex: string;
}) {
  const isPortrait = mode === "portrait";
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 shadow-xl transition-all duration-300"
        style={{
          width: isPortrait ? 80 : 128,
          height: isPortrait ? 120 : 72,
          borderRadius: radius,
          boxShadow: `0 0 0 2.5px ${focusHex}, 0 0 12px ${focusHex}55`,
        }}
      >
        {/* Faux contenu poster */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-neutral-900" />
        <div className="absolute bottom-0 inset-x-0 p-1.5">
          <div className="h-1.5 w-10 rounded bg-white/30 mb-1" />
          <div className="h-1 w-7 rounded bg-white/20" />
        </div>
      </div>
      <span className="text-[11px] text-white/50">{isPortrait ? "Portrait 2:3" : "Paysage 16:9"}</span>
    </div>
  );
}

/* ─── Aperçu Nav Bar Mobile ──────────────────────────────────────────────── */
function NavBarPreview({ style, glow }: { style: string; glow: boolean }) {
  const icons = ["🏠", "🔍", "📱", "⚙️"];
  const isInline = style === "inline";
  return (
    <div className="rounded-xl bg-neutral-950 border border-white/10 overflow-hidden w-48 mx-auto">
      {/* Écran factice */}
      <div className="h-20 bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-xs text-white/30">Écran</div>
      </div>
      {/* Nav bar */}
      <div
        className="relative"
        style={{
          boxShadow: glow ? "0 -8px 24px rgba(99,102,241,0.25)" : "none",
        }}
      >
        <div className="flex bg-black/90 backdrop-blur px-2 py-1.5 gap-0.5">
          {icons.map((icon, i) => (
            <div
              key={i}
              className={`flex-1 flex text-center transition-all ${
                isInline ? "flex-row gap-1 items-center justify-center" : "flex-col items-center gap-0.5"
              } py-1 rounded-lg ${i === 0 ? "bg-indigo-500/20" : ""}`}
            >
              <span className="text-base leading-none">{icon}</span>
              {!isInline && (
                <span className="text-[9px] text-white/50">
                  {["Accueil","Chercher","Profil","Réglages"][i]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Aperçu Thème ───────────────────────────────────────────────────────── */
function ThemePreview({ mode }: { mode: string }) {
  const bg = mode === "oled_black" ? "#000000" : "#0D111A";
  return (
    <div
      className="rounded-xl border border-white/10 overflow-hidden w-32 mx-auto"
      style={{ background: bg }}
    >
      <div className="p-2.5">
        <div className="h-1.5 w-16 rounded bg-white/20 mb-1.5" />
        <div className="h-1 w-10 rounded bg-white/10 mb-2" />
        <div className="flex gap-1">
          <div className="h-8 flex-1 rounded-lg bg-white/[0.06] border border-white/[0.08]" />
          <div className="h-8 flex-1 rounded-lg bg-white/[0.06] border border-white/[0.08]" />
        </div>
      </div>
      <div className="px-2.5 pb-2 flex items-center justify-between">
        <div className="h-1 w-6 rounded bg-white/10" />
        <div className="text-[9px] text-white/30">{mode === "oled_black" ? "#000000" : "#0D111A"}</div>
      </div>
    </div>
  );
}

/* ─── Composant principal ────────────────────────────────────────────────── */
export function ManageSettingsPanel() {
  const companionProfile = useCompanionProfile();
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("appearance");

  // Couleur focus
  const [focusBorderColor, setFocusBorderColor] = useState("White");
  const [focusCustomHex, setFocusCustomHex] = useState("#FFFFFF");
  const [useCustomColor, setUseCustomColor] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Thème & apparence
  const [appBackgroundMode, setAppBackgroundMode] = useState("original");
  const [profilePickerBackground, setProfilePickerBackground] = useState("glow");
  const [detailsAmbientColor, setDetailsAmbientColor] = useState(true);
  const [profileAmbientColor, setProfileAmbientColor] = useState(true);
  const [megatvIntroAnimationEnabled, setMegatvIntroAnimationEnabled] = useState(true);
  const [uiNavSoundsEnabled, setUiNavSoundsEnabled] = useState(true);
  const [clockFormat, setClockFormat] = useState("24h");
  const [skipProfileSelection, setSkipProfileSelection] = useState(false);

  // Posters
  const [cardLayoutMode, setCardLayoutMode] = useState("landscape");
  const [posterCardRadiusDp, setPosterCardRadiusDp] = useState(12);
  const [posterArtLang, setPosterArtLang] = useState("fr");
  const [spoilerBlurEnabled, setSpoilerBlurEnabled] = useState(false);
  const [posterFriendsWatching, setPosterFriendsWatching] = useState(true);
  const [posterFriendsCompleted, setPosterFriendsCompleted] = useState(true);
  const [continueWatchingCardStyle, setContinueWatchingCardStyle] = useState("carte");
  const [cwPreferEpisodeThumbnail, setCwPreferEpisodeThumbnail] = useState(false);
  const [episodeCardStyle, setEpisodeCardStyle] = useState("horizontal");

  // Lecture
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [autoPlaySingleSource, setAutoPlaySingleSource] = useState(true);
  const [autoPlayMinQuality, setAutoPlayMinQuality] = useState("Any");
  const [trailerAutoPlay, setTrailerAutoPlay] = useState(false);
  const [trailerSoundEnabled, setTrailerSoundEnabled] = useState(false);
  const [trailerFullscreenEnabled, setTrailerFullscreenEnabled] = useState(true);
  const [heroTrailerDelaySeconds, setHeroTrailerDelaySeconds] = useState(5);
  const [heroTrailerFullscreenDelaySeconds, setHeroTrailerFullscreenDelaySeconds] = useState(8);

  // Sous-titres
  const [defaultAudioLanguage, setDefaultAudioLanguage] = useState("auto");
  const [defaultSubtitle, setDefaultSubtitle] = useState("Off");
  const [secondarySubtitle, setSecondarySubtitle] = useState("Off");
  const [subtitleSize, setSubtitleSize] = useState("Medium");
  const [subtitleColor, setSubtitleColor] = useState("White");
  const [subtitleStyle, setSubtitleStyle] = useState("Bold");
  const [subtitleOffset, setSubtitleOffset] = useState("Low");
  const [filterSubtitlesByLanguage, setFilterSubtitlesByLanguage] = useState(true);
  const [subtitleStylized, setSubtitleStylized] = useState(true);

  // Mobile
  const [mobileNavBarStyle, setMobileNavBarStyle] = useState("inline");
  const [mobileNavGlowEnabled, setMobileNavGlowEnabled] = useState(true);

  // Cover
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverSynced, setCoverSynced] = useState(false);

  // Couleur focus résolue (hex)
  const resolvedFocusHex = useCustomColor
    ? focusCustomHex
    : (PRESET_COLORS.find((c) => c.name === focusBorderColor)?.hex ?? "#FFFFFF");

  /* ── Chargement profils ── */
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

  /* ── Sync context → local ── */
  useEffect(() => {
    if (companionProfile?.activeProfileId && companionProfile.activeProfileId !== selectedProfileId) {
      setSelectedProfileId(companionProfile.activeProfileId);
    }
  }, [companionProfile?.activeProfileId, selectedProfileId]);

  /* ── Chargement réglages ── */
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
        if (s.poster_art_lang) setPosterArtLang(s.poster_art_lang);
        if (s.spoiler_blur_enabled !== undefined) setSpoilerBlurEnabled(Boolean(s.spoiler_blur_enabled));
        if (s.poster_friends_watching !== undefined) setPosterFriendsWatching(Boolean(s.poster_friends_watching));
        if (s.poster_friends_completed !== undefined) setPosterFriendsCompleted(Boolean(s.poster_friends_completed));
        if (s.continue_watching_card_style) setContinueWatchingCardStyle(s.continue_watching_card_style);
        if (s.cw_prefer_episode_thumbnail !== undefined) setCwPreferEpisodeThumbnail(Boolean(s.cw_prefer_episode_thumbnail));
        if (s.episode_card_style) setEpisodeCardStyle(s.episode_card_style);
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
        if (s.mobile_nav_bar_style) setMobileNavBarStyle(s.mobile_nav_bar_style);
        if (s.mobile_nav_glow_enabled !== undefined) setMobileNavGlowEnabled(Boolean(s.mobile_nav_glow_enabled));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProfileId]);

  /* ── Sauvegarde ── */
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
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  /* ── Upload couverture ── */
  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedProfileId) return;
    setCoverUploading(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 960;
          let w = img.width, h = img.height;
          if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas error"));
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Compression failed")), "image/jpeg", 0.75);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
      const fd = new FormData();
      fd.append("file", blob, "cover.jpg");
      const res = await fetch(`/api/profiles/${selectedProfileId}/cover`, { method: "POST", body: fd });
      if (res.ok) { setCoverSynced(true); setTimeout(() => setCoverSynced(false), 4000); }
    } catch (e) {
      console.error(e);
    } finally {
      setCoverUploading(false);
    }
  }

  /* ── Rendu ── */
  return (
    <div className="space-y-0">

      {/* ── BARRE STICKY: profil + bouton save ── */}
      <div className="sticky top-0 z-20 -mx-1 mb-5">
        <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.08] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Sliders className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Paramètres TV & Mobile</p>
              <p className="text-[11px] text-white/40">MegaSync instantané sur tous vos appareils</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sélecteur profil */}
            {profiles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Profil :</span>
                <select
                  value={selectedProfileId}
                  onChange={(e) => {
                    setSelectedProfileId(e.target.value);
                    companionProfile?.setActiveProfileId(e.target.value);
                  }}
                  className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Bouton save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              {saving ? (
                <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sync en cours…</>
              ) : saveSuccess ? (
                <><Check className="h-3.5 w-3.5 text-emerald-300" /> Synchronisé !</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5" /> Enregistrer & Sync</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── ONGLETS ── */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === id
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80 border border-white/[0.06]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── CONTENU ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/40 gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Chargement des préférences…</span>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ══════════ INTERFACE & THÈME ══════════ */}
          {activeTab === "appearance" && (
            <>
              {/* Couleur Focus */}
              <SettingCard>
                <SectionTitle>Couleur de Focus D-Pad TV</SectionTitle>
                <p className="text-xs text-white/40 mb-4">Bordure lumineuse sur l&apos;élément sélectionné à la télécommande.</p>

                {/* Aperçu live */}
                <div className="flex items-center justify-center mb-5">
                  <div
                    className="h-14 w-14 rounded-2xl bg-neutral-800 transition-all duration-300"
                    style={{ boxShadow: `0 0 0 3px ${resolvedFocusHex}, 0 0 20px ${resolvedFocusHex}66` }}
                  />
                  <ChevronRight className="h-5 w-5 text-white/20 mx-3" />
                  <div className="text-xs text-white/50">
                    Aperçu bordure active<br/>
                    <span className="font-mono text-indigo-400">{resolvedFocusHex}</span>
                  </div>
                </div>

                {/* Palettes preset */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => { setFocusBorderColor(c.name); setUseCustomColor(false); }}
                      className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl border transition-all ${
                        !useCustomColor && focusBorderColor === c.name
                          ? "border-white/60 bg-white/10 scale-105"
                          : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07]"
                      }`}
                    >
                      <div
                        className="h-7 w-7 rounded-full border border-black/20 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[10px] text-white/60">{c.label}</span>
                    </button>
                  ))}
                </div>

                {/* Couleur personnalisée */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomColor(true);
                      setTimeout(() => colorInputRef.current?.click(), 50);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      useCustomColor
                        ? "border-indigo-400/60 bg-indigo-500/10 text-white"
                        : "border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className="h-4 w-4 rounded-md border border-white/20"
                      style={{ background: useCustomColor ? focusCustomHex : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
                    />
                    Couleur personnalisée
                    <input
                      ref={colorInputRef}
                      type="color"
                      value={focusCustomHex}
                      onChange={(e) => { setFocusCustomHex(e.target.value); setUseCustomColor(true); }}
                      className="sr-only"
                    />
                  </button>
                  {useCustomColor && (
                    <span className="text-xs font-mono text-indigo-400">{focusCustomHex}</span>
                  )}
                </div>
              </SettingCard>

              {/* Thème arrière-plan */}
              <SettingCard>
                <SectionTitle>Thème d&apos;arrière-plan TV</SectionTitle>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-2">
                    {[
                      { value: "original",   label: "Original Dark",  sub: "#0D111A — Défaut MegaTv" },
                      { value: "oled_black", label: "OLED Noir Absolu", sub: "#000000 — Pour écrans AMOLED" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAppBackgroundMode(opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          appBackgroundMode === opt.value
                            ? "border-indigo-500/50 bg-indigo-500/10"
                            : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg border border-white/10 shrink-0 ${opt.value === "oled_black" ? "bg-black" : "bg-[#0D111A]"}`} />
                        <div>
                          <p className="text-xs font-semibold text-white">{opt.label}</p>
                          <p className="text-[11px] text-white/40">{opt.sub}</p>
                        </div>
                        {appBackgroundMode === opt.value && (
                          <Check className="h-4 w-4 text-indigo-400 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Aperçu thème */}
                  <div className="flex flex-col items-center gap-2">
                    <ThemePreview mode={appBackgroundMode} />
                    <span className="text-[11px] text-white/40">Aperçu</span>
                  </div>
                </div>
              </SettingCard>

              {/* Écran sélecteur de profil */}
              <SettingCard>
                <SectionTitle>Écran de sélection de profil TV</SectionTitle>
                <SegmentControl
                  value={profilePickerBackground}
                  onChange={setProfilePickerBackground}
                  options={[
                    { value: "glow",        label: "Halo lumineux (Glow)" },
                    { value: "illuminated", label: "Illumination douce" },
                  ]}
                />
              </SettingCard>

              {/* Toggles Ambiance & Interface */}
              <SettingCard>
                <SectionTitle>Animations & Sons</SectionTitle>
                <div className="divide-y divide-white/[0.05]">
                  <ToggleRow label="Couleurs d'ambiance (Fiches)" sub="Arrière-plans adaptatifs aux posters" checked={detailsAmbientColor} onChange={setDetailsAmbientColor} />
                  <ToggleRow label="Ambiance sur l'écran profil" sub="Halo coloré autour des avatars" checked={profileAmbientColor} onChange={setProfileAmbientColor} />
                  <ToggleRow label="Animation d'introduction MegaTv" sub="Splash screen animé au démarrage" checked={megatvIntroAnimationEnabled} onChange={setMegatvIntroAnimationEnabled} />
                  <ToggleRow label="Sons de navigation D-pad TV" sub="Bips au clic télécommande" checked={uiNavSoundsEnabled} onChange={setUiNavSoundsEnabled} />
                  <ToggleRow label="Passer la sélection de profil" sub="Connexion directe sans écran de choix" checked={skipProfileSelection} onChange={setSkipProfileSelection} />
                </div>
              </SettingCard>

              {/* Format horloge */}
              <SettingCard>
                <SectionTitle>Horloge TV</SectionTitle>
                <SegmentControl
                  value={clockFormat}
                  onChange={setClockFormat}
                  options={[
                    { value: "24h", label: "24 Heures (14:30)" },
                    { value: "12h", label: "12 Heures (2:30 PM)" },
                  ]}
                />
              </SettingCard>
            </>
          )}

          {/* ══════════ POSTERS & ACCUEIL ══════════ */}
          {activeTab === "posters" && (
            <>
              {/* Format des affiches avec aperçu */}
              <SettingCard>
                <SectionTitle>Format des affiches (Posters)</SectionTitle>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-2">
                    {[
                      { value: "landscape", label: "Paysage 16:9",  sub: "Format large moderne — style streaming" },
                      { value: "portrait",  label: "Portrait 2:3",  sub: "Affiche cinéma verticale — style classique" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCardLayoutMode(opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          cardLayoutMode === opt.value
                            ? "border-indigo-500/50 bg-indigo-500/10"
                            : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className={`shrink-0 rounded-lg bg-white/10 border border-white/10 ${opt.value === "landscape" ? "w-12 h-7" : "w-7 h-10"}`} />
                        <div>
                          <p className="text-xs font-semibold text-white">{opt.label}</p>
                          <p className="text-[11px] text-white/40">{opt.sub}</p>
                        </div>
                        {cardLayoutMode === opt.value && <Check className="h-4 w-4 text-indigo-400 ml-auto" />}
                      </button>
                    ))}
                  </div>
                  {/* Aperçu live poster */}
                  <div className="mx-auto sm:mx-0">
                    <PosterPreview mode={cardLayoutMode} radius={posterCardRadiusDp} focusHex={resolvedFocusHex} />
                  </div>
                </div>
              </SettingCard>

              {/* Rayon des coins */}
              <SettingCard>
                <SectionTitle>Arrondi des coins</SectionTitle>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-white/60">Rayon des cartes de films et séries</p>
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">{posterCardRadiusDp} dp</span>
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
                <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
                  <span>Carré (0)</span><span>8</span><span>16</span><span>24</span><span>Rond (32)</span>
                </div>
              </SettingCard>

              {/* Continue Watching */}
              <SettingCard>
                <SectionTitle>Continuer à regarder (CW)</SectionTitle>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/60 mb-2">Style des cartes de reprise</p>
                    <SegmentControl
                      value={continueWatchingCardStyle}
                      onChange={setContinueWatchingCardStyle}
                      options={[
                        { value: "carte",    label: "Carte complète" },
                        { value: "banniere", label: "Bannière compacte" },
                      ]}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-2">Style cartes d&apos;épisodes</p>
                    <SegmentControl
                      value={episodeCardStyle}
                      onChange={setEpisodeCardStyle}
                      options={[
                        { value: "horizontal", label: "Horizontal" },
                        { value: "vertical",   label: "Vertical" },
                      ]}
                    />
                  </div>
                  <div className="divide-y divide-white/[0.05]">
                    <ToggleRow label="Vignette d'épisode préférée" sub="Scène de l'épisode au lieu de l'affiche série" checked={cwPreferEpisodeThumbnail} onChange={setCwPreferEpisodeThumbnail} />
                  </div>
                </div>
              </SettingCard>

              {/* Langue & Source */}
              <SettingCard>
                <SectionTitle>Métadonnées & Langue des affiches</SectionTitle>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">Langue des métadonnées TMDB</p>
                    <p className="text-xs text-white/40">Titres, synopsis et affiches dans cette langue</p>
                  </div>
                  <SegmentControl
                    value={posterArtLang}
                    onChange={setPosterArtLang}
                    options={[
                      { value: "fr", label: "🇫🇷 FR" },
                      { value: "en", label: "🇬🇧 EN" },
                    ]}
                  />
                </div>
              </SettingCard>

              {/* Badges sociaux & Anti-spoiler */}
              <SettingCard>
                <SectionTitle>Social & Anti-spoiler</SectionTitle>
                <div className="divide-y divide-white/[0.05]">
                  <ToggleRow label="Flou anti-spoiler" sub="Floute les vignettes d'épisodes non vus" checked={spoilerBlurEnabled} onChange={setSpoilerBlurEnabled} />
                  <ToggleRow label="Badge amis — En cours" sub="Affiche l'avatar des amis qui regardent" checked={posterFriendsWatching} onChange={setPosterFriendsWatching} />
                  <ToggleRow label="Badge amis — Terminé" sub="Affiche l'avatar des amis ayant fini" checked={posterFriendsCompleted} onChange={setPosterFriendsCompleted} />
                </div>
              </SettingCard>

              {/* Couverture profil */}
              <SettingCard>
                <SectionTitle>Photo de couverture (Bannière profil)</SectionTitle>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-xs font-medium text-white cursor-pointer transition-all active:scale-95">
                    <Upload className="h-3.5 w-3.5" />
                    {coverUploading ? "Compression & Upload…" : "Téléverser (auto ≤ 40 Ko)"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCover} disabled={coverUploading} />
                  </label>
                  {coverSynced && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Couverture synchronisée
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/30 mt-2">L&apos;image est compressée côté navigateur avant envoi — aucun poids excessif sur Supabase Storage.</p>
              </SettingCard>
            </>
          )}

          {/* ══════════ LECTURE & CW ══════════ */}
          {activeTab === "playback" && (
            <>
              <SettingCard>
                <SectionTitle>Lecture automatique</SectionTitle>
                <div className="divide-y divide-white/[0.05]">
                  <ToggleRow label="Épisode suivant automatique (Autoplay)" sub="Enchaîne directement sans retour au menu" checked={autoPlayNext} onChange={setAutoPlayNext} />
                  <ToggleRow label="Lancer la source unique directement" sub="Évite le panneau de sélection si 1 seul flux" checked={autoPlaySingleSource} onChange={setAutoPlaySingleSource} />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-white/60 mb-2">Qualité minimale pour l&apos;Autoplay</p>
                  <SegmentControl
                    value={autoPlayMinQuality}
                    onChange={setAutoPlayMinQuality}
                    options={[
                      { value: "Any",  label: "Toutes" },
                      { value: "1080p",label: "≥ 1080p" },
                      { value: "4K",   label: "≥ 4K" },
                    ]}
                  />
                </div>
              </SettingCard>

              <SettingCard>
                <SectionTitle>Bandes-annonces Hero (Accueil TV)</SectionTitle>
                <div className="divide-y divide-white/[0.05]">
                  <ToggleRow label="Lecture automatique de la bande-annonce" sub="Démarre la vidéo en bannière d'accueil" checked={trailerAutoPlay} onChange={setTrailerAutoPlay} />
                  <ToggleRow label="Son de la bande-annonce" sub="Active l'audio d'arrière-plan" checked={trailerSoundEnabled} onChange={setTrailerSoundEnabled} />
                  <ToggleRow label="Plein écran automatique après délai" sub="S'étend après inactivité" checked={trailerFullscreenEnabled} onChange={setTrailerFullscreenEnabled} />
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-white/70 font-medium">Délai avant démarrage</span>
                      <span className="font-mono text-indigo-400">{heroTrailerDelaySeconds} s</span>
                    </div>
                    <input type="range" min="1" max="15" value={heroTrailerDelaySeconds}
                      onChange={(e) => setHeroTrailerDelaySeconds(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer" />
                    <div className="flex justify-between text-[10px] text-white/30 mt-1"><span>1 s</span><span>15 s</span></div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-white/70 font-medium">Délai avant plein écran</span>
                      <span className="font-mono text-indigo-400">{heroTrailerFullscreenDelaySeconds} s</span>
                    </div>
                    <input type="range" min="3" max="20" value={heroTrailerFullscreenDelaySeconds}
                      onChange={(e) => setHeroTrailerFullscreenDelaySeconds(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer" />
                    <div className="flex justify-between text-[10px] text-white/30 mt-1"><span>3 s</span><span>20 s</span></div>
                  </div>
                </div>
              </SettingCard>
            </>
          )}

          {/* ══════════ SOUS-TITRES & AUDIO ══════════ */}
          {activeTab === "subtitles" && (
            <>
              <SettingCard>
                <SectionTitle>Langues par défaut</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Audio par défaut", value: defaultAudioLanguage, onChange: setDefaultAudioLanguage,
                      opts: [["auto","Automatique"],["fr","Français"],["en","Anglais"]] },
                    { label: "Sous-titres principaux", value: defaultSubtitle, onChange: setDefaultSubtitle,
                      opts: [["Off","Désactivés"],["French","Français"],["English","Anglais"]] },
                    { label: "Sous-titres secondaires", value: secondarySubtitle, onChange: setSecondarySubtitle,
                      opts: [["Off","Désactivés"],["English","Anglais"],["French","Français"]] },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-xs text-white/50 mb-1.5 font-medium">{field.label}</p>
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        {field.opts.map(([v, l]) => (
                          <option key={v} value={v} className="bg-neutral-900">{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </SettingCard>

              <SettingCard>
                <SectionTitle>Apparence du texte</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Taille", value: subtitleSize, onChange: setSubtitleSize,
                      opts: [["Small","Petit"],["Medium","Normal"],["Large","Grand"],["ExtraLarge","Très grand"]] },
                    { label: "Couleur", value: subtitleColor, onChange: setSubtitleColor,
                      opts: [["White","Blanc"],["Yellow","Jaune"],["Cyan","Cyan"],["Green","Vert"]] },
                    { label: "Style", value: subtitleStyle, onChange: setSubtitleStyle,
                      opts: [["Bold","Gras"],["Normal","Normal"]] },
                    { label: "Position", value: subtitleOffset, onChange: setSubtitleOffset,
                      opts: [["Low","Bas (Standard)"],["High","Haut"]] },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-xs text-white/50 mb-1.5 font-medium">{field.label}</p>
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {field.opts.map(([v, l]) => (
                          <option key={v} value={v} className="bg-neutral-900">{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Aperçu texte */}
                <div className="rounded-xl bg-black/60 flex items-end justify-center py-4 px-4 h-16 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/40 to-black/60" />
                  <p
                    className="relative z-10 text-center leading-tight transition-all"
                    style={{
                      fontSize: subtitleSize === "Small" ? 11 : subtitleSize === "Large" ? 16 : subtitleSize === "ExtraLarge" ? 20 : 13,
                      fontWeight: subtitleStyle === "Bold" ? 700 : 400,
                      color: subtitleColor === "Yellow" ? "#FFDD44" : subtitleColor === "Cyan" ? "#22D3EE" : subtitleColor === "Green" ? "#4ADE80" : "#FFFFFF",
                      textShadow: subtitleStylized ? "0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)" : "none",
                    }}
                  >
                    Aperçu des sous-titres MegaTv
                  </p>
                </div>

                <div className="divide-y divide-white/[0.05]">
                  <ToggleRow label="Contour & ombre (Stylisé)" sub="Meilleure lisibilité sur fonds clairs" checked={subtitleStylized} onChange={setSubtitleStylized} />
                  <ToggleRow label="Filtrer les pistes par langue" sub="Masque les langues non pertinentes" checked={filterSubtitlesByLanguage} onChange={setFilterSubtitlesByLanguage} />
                </div>
              </SettingCard>
            </>
          )}

          {/* ══════════ MOBILE ══════════ */}
          {activeTab === "mobile" && (
            <>
              <SettingCard>
                <SectionTitle>Barre de navigation</SectionTitle>
                <p className="text-xs text-white/40 mb-4">Style visuel de la barre en bas de l&apos;écran sur smartphone et tablette.</p>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-2">
                    {[
                      { value: "inline",  label: "Boutons inclinés (Inline)", sub: "Icône + label sur la même ligne — compact" },
                      { value: "stacked", label: "Empilés (Stacked)", sub: "Icône au-dessus du label — plus lisible" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMobileNavBarStyle(opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          mobileNavBarStyle === opt.value
                            ? "border-indigo-500/50 bg-indigo-500/10"
                            : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <Smartphone className="h-4 w-4 text-white/40 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white">{opt.label}</p>
                          <p className="text-[11px] text-white/40">{opt.sub}</p>
                        </div>
                        {mobileNavBarStyle === opt.value && <Check className="h-4 w-4 text-indigo-400 ml-auto" />}
                      </button>
                    ))}
                  </div>
                  {/* Aperçu nav bar */}
                  <div className="flex flex-col items-center gap-2">
                    <NavBarPreview style={mobileNavBarStyle} glow={mobileNavGlowEnabled} />
                    <span className="text-[11px] text-white/40">Aperçu</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <ToggleRow
                    label="Halo lumineux (Glow fluide)"
                    sub="Accentuation lumineuse indigo en bas d'écran"
                    checked={mobileNavGlowEnabled}
                    onChange={setMobileNavGlowEnabled}
                  />
                </div>
              </SettingCard>

              {/* Note isolation */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/20">
                <ShieldAlert className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white mb-1">Isolation matérielle (Per-Device) préservée</p>
                  <p className="text-xs text-indigo-200/60 leading-relaxed">
                    Les réglages matériels locaux — ajustement de fréquence d&apos;images (AFR), lecteur externe, boost sonore matériel, serveurs DNS — restent spécifiques à chaque appareil physique et ne sont pas synchronisés à distance, garantissant la compatibilité de chaque écran.
                  </p>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}
