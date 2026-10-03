"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Palette,
  Monitor,
  Film,
  Sliders,
  Check,
  RefreshCw,
  Upload,
  Volume2,
  Subtitles,
  PlaySquare,
  Clock,
  LayoutGrid,
  ShieldAlert,
  Smartphone
} from "lucide-react";
import { MegaSurface } from "@/features/companion/ui/MegaSurface";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

const FOCUS_COLORS = [
  { name: "White", label: "Blanc Pur", hex: "#FFFFFF" },
  { name: "Red", label: "Rouge", hex: "#E50914" },
  { name: "Orange", label: "Orange", hex: "#F59E0B" },
  { name: "Yellow", label: "Jaune", hex: "#FFDD44" },
  { name: "Green", label: "Vert Émeraude", hex: "#1DB954" },
  { name: "Blue", label: "Bleu Océan", hex: "#3B82F6" },
  { name: "Indigo", label: "Indigo", hex: "#6366F1" },
  { name: "Violet", label: "Rose / Violet", hex: "#EC4899" },
];

const SUBTITLE_COLORS = [
  { value: "White", label: "Blanc" },
  { value: "Yellow", label: "Jaune" },
  { value: "Cyan", label: "Cyan" },
  { value: "Green", label: "Vert" },
];

const SUBTITLE_SIZES = [
  { value: "Small", label: "Petit" },
  { value: "Medium", label: "Normal (Défaut)" },
  { value: "Large", label: "Grand" },
  { value: "ExtraLarge", label: "Très grand" },
];

export function ManageSettingsPanel() {
  const companionProfile = useCompanionProfile();
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "posters" | "playback" | "subtitles" | "mobile">("appearance");

  // --- 1. Apparence & D-Pad ---
  const [focusBorderColor, setFocusBorderColor] = useState("White");
  const [appBackgroundMode, setAppBackgroundMode] = useState("original");
  const [oledBlackBackground, setOledBlackBackground] = useState(false);
  const [profilePickerBackground, setProfilePickerBackground] = useState("glow");
  const [detailsAmbientColor, setDetailsAmbientColor] = useState(true);
  const [profileAmbientColor, setProfileAmbientColor] = useState(true);
  const [megatvIntroAnimationEnabled, setMegatvIntroAnimationEnabled] = useState(true);
  const [uiNavSoundsEnabled, setUiNavSoundsEnabled] = useState(true);
  const [clockFormat, setClockFormat] = useState("24h");
  const [skipProfileSelection, setSkipProfileSelection] = useState(false);

  // --- 2. Posters & Accueil ---
  const [cardLayoutMode, setCardLayoutMode] = useState("landscape");
  const [posterCardRadiusDp, setPosterCardRadiusDp] = useState(28);
  const [posterFocusColorMode, setPosterFocusColorMode] = useState("profile");
  const [posterFocusAlpha, setPosterFocusAlpha] = useState(100);
  const [episodeCardStyle, setEpisodeCardStyle] = useState("horizontal");
  const [continueWatchingCardStyle, setContinueWatchingCardStyle] = useState("carte");
  const [cwPreferEpisodeThumbnail, setCwPreferEpisodeThumbnail] = useState(false);
  const [posterArtProvider, setPosterArtProvider] = useState("tmdb");
  const [posterArtLang, setPosterArtLang] = useState("fr");
  const [spoilerBlurEnabled, setSpoilerBlurEnabled] = useState(false);
  const [posterFriendsWatching, setPosterFriendsWatching] = useState(true);
  const [posterFriendsCompleted, setPosterFriendsCompleted] = useState(true);

  // --- 3. Lecture & Hero Trailer ---
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [autoPlaySingleSource, setAutoPlaySingleSource] = useState(true);
  const [autoPlayMinQuality, setAutoPlayMinQuality] = useState("Any");
  const [trailerAutoPlay, setTrailerAutoPlay] = useState(false);
  const [trailerSoundEnabled, setTrailerSoundEnabled] = useState(false);
  const [trailerFullscreenEnabled, setTrailerFullscreenEnabled] = useState(true);
  const [heroOverviewDelaySeconds, setHeroOverviewDelaySeconds] = useState(3);
  const [heroTrailerDelaySeconds, setHeroTrailerDelaySeconds] = useState(5);
  const [heroTrailerFullscreenDelaySeconds, setHeroTrailerFullscreenDelaySeconds] = useState(8);

  // --- 4. Audio & Sous-titres ---
  const [defaultAudioLanguage, setDefaultAudioLanguage] = useState("auto");
  const [defaultSubtitle, setDefaultSubtitle] = useState("Off");
  const [secondarySubtitle, setSecondarySubtitle] = useState("Off");
  const [subtitleSize, setSubtitleSize] = useState("Medium");
  const [subtitleColor, setSubtitleColor] = useState("White");
  const [subtitleStyle, setSubtitleStyle] = useState("Bold");
  const [subtitleOffset, setSubtitleOffset] = useState("Low");
  const [filterSubtitlesByLanguage, setFilterSubtitlesByLanguage] = useState(true);
  const [subtitleStylized, setSubtitleStylized] = useState(true);

  // --- 5. Mobile & Ergonomie ---
  const [mobileNavBarStyle, setMobileNavBarStyle] = useState("inline");
  const [mobileNavGlowEnabled, setMobileNavGlowEnabled] = useState(true);

  // Cover upload
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Charger la liste des profils
  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch("/api/profiles/active");
        if (res.ok) {
          const data = await res.json();
          if (data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles);
            const initialId = companionProfile?.activeProfileId || data.activeProfileId || data.profiles[0].id;
            setSelectedProfileId(initialId);
          }
        }
      } catch (err) {
        console.error("Failed to load profiles", err);
      }
    }
    loadProfiles();
  }, [companionProfile?.activeProfileId]);

  // Synchroniser quand le profil change dans le context
  useEffect(() => {
    if (companionProfile?.activeProfileId && companionProfile.activeProfileId !== selectedProfileId) {
      setSelectedProfileId(companionProfile.activeProfileId);
    }
  }, [companionProfile?.activeProfileId, selectedProfileId]);

  // Charger les réglages du profil actif
  useEffect(() => {
    if (!selectedProfileId) return;
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch(`/api/companion/settings?profileId=${selectedProfileId}`);
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || {};

          // Apparence
          if (s.focus_border_color) setFocusBorderColor(s.focus_border_color);
          if (s.app_background_mode) setAppBackgroundMode(s.app_background_mode);
          if (s.oled_black_background !== undefined) setOledBlackBackground(Boolean(s.oled_black_background));
          if (s.profile_picker_background) setProfilePickerBackground(s.profile_picker_background);
          if (s.details_ambient_color !== undefined) setDetailsAmbientColor(Boolean(s.details_ambient_color));
          if (s.profile_ambient_color !== undefined) setProfileAmbientColor(Boolean(s.profile_ambient_color));
          if (s.megatv_intro_animation_enabled !== undefined) setMegatvIntroAnimationEnabled(Boolean(s.megatv_intro_animation_enabled));
          if (s.ui_nav_sounds_enabled !== undefined) setUiNavSoundsEnabled(Boolean(s.ui_nav_sounds_enabled));
          if (s.clock_format) setClockFormat(s.clock_format);
          if (s.skip_profile_selection !== undefined) setSkipProfileSelection(Boolean(s.skip_profile_selection));

          // Posters
          if (s.card_layout_mode) setCardLayoutMode(s.card_layout_mode);
          if (s.poster_card_radius_dp !== undefined) setPosterCardRadiusDp(Number(s.poster_card_radius_dp));
          if (s.poster_focus_color_mode) setPosterFocusColorMode(s.poster_focus_color_mode);
          if (s.poster_focus_alpha !== undefined) setPosterFocusAlpha(Number(s.poster_focus_alpha));
          if (s.episode_card_style) setEpisodeCardStyle(s.episode_card_style);
          if (s.continue_watching_card_style) setContinueWatchingCardStyle(s.continue_watching_card_style);
          if (s.cw_prefer_episode_thumbnail !== undefined) setCwPreferEpisodeThumbnail(Boolean(s.cw_prefer_episode_thumbnail));
          if (s.poster_art_provider) setPosterArtProvider(s.poster_art_provider);
          if (s.poster_art_lang) setPosterArtLang(s.poster_art_lang);
          if (s.spoiler_blur_enabled !== undefined) setSpoilerBlurEnabled(Boolean(s.spoiler_blur_enabled));
          if (s.poster_friends_watching !== undefined) setPosterFriendsWatching(Boolean(s.poster_friends_watching));
          if (s.poster_friends_completed !== undefined) setPosterFriendsCompleted(Boolean(s.poster_friends_completed));

          // Playback
          if (s.auto_play_next !== undefined) setAutoPlayNext(Boolean(s.auto_play_next));
          if (s.auto_play_single_source !== undefined) setAutoPlaySingleSource(Boolean(s.auto_play_single_source));
          if (s.auto_play_min_quality) setAutoPlayMinQuality(s.auto_play_min_quality);
          if (s.trailer_auto_play !== undefined) setTrailerAutoPlay(Boolean(s.trailer_auto_play));
          if (s.trailer_sound_enabled !== undefined) setTrailerSoundEnabled(Boolean(s.trailer_sound_enabled));
          if (s.trailer_fullscreen_enabled !== undefined) setTrailerFullscreenEnabled(Boolean(s.trailer_fullscreen_enabled));
          if (s.hero_overview_delay_seconds !== undefined) setHeroOverviewDelaySeconds(Number(s.hero_overview_delay_seconds));
          if (s.hero_trailer_delay_seconds !== undefined) setHeroTrailerDelaySeconds(Number(s.hero_trailer_delay_seconds));
          if (s.hero_trailer_fullscreen_delay_seconds !== undefined) setHeroTrailerFullscreenDelaySeconds(Number(s.hero_trailer_fullscreen_delay_seconds));

          // Subtitles & Audio
          if (s.default_audio_language) setDefaultAudioLanguage(s.default_audio_language);
          if (s.default_subtitle) setDefaultSubtitle(s.default_subtitle);
          if (s.secondary_subtitle) setSecondarySubtitle(s.secondary_subtitle);
          if (s.subtitle_size) setSubtitleSize(s.subtitle_size);
          if (s.subtitle_color) setSubtitleColor(s.subtitle_color);
          if (s.subtitle_style) setSubtitleStyle(s.subtitle_style);
          if (s.subtitle_offset) setSubtitleOffset(s.subtitle_offset);
          if (s.filter_subtitles_by_language !== undefined) setFilterSubtitlesByLanguage(Boolean(s.filter_subtitles_by_language));
          if (s.subtitle_stylized !== undefined) setSubtitleStylized(Boolean(s.subtitle_stylized));

          // Mobile
          if (s.mobile_nav_bar_style) setMobileNavBarStyle(s.mobile_nav_bar_style);
          if (s.mobile_nav_glow_enabled !== undefined) setMobileNavGlowEnabled(Boolean(s.mobile_nav_glow_enabled));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [selectedProfileId]);

  async function handleSaveSettings() {
    if (!selectedProfileId) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        profileId: selectedProfileId,
        settings: {
          // Apparence
          focus_border_color: focusBorderColor,
          app_background_mode: appBackgroundMode,
          oled_black_background: appBackgroundMode === "oled_black" || oledBlackBackground,
          profile_picker_background: profilePickerBackground,
          details_ambient_color: detailsAmbientColor,
          profile_ambient_color: profileAmbientColor,
          megatv_intro_animation_enabled: megatvIntroAnimationEnabled,
          ui_nav_sounds_enabled: uiNavSoundsEnabled,
          clock_format: clockFormat,
          skip_profile_selection: skipProfileSelection,

          // Posters & Accueil
          card_layout_mode: cardLayoutMode,
          poster_card_radius_dp: posterCardRadiusDp,
          poster_focus_color_mode: posterFocusColorMode,
          poster_focus_alpha: posterFocusAlpha,
          episode_card_style: episodeCardStyle,
          continue_watching_card_style: continueWatchingCardStyle,
          cw_prefer_episode_thumbnail: cwPreferEpisodeThumbnail,
          poster_art_provider: posterArtProvider,
          poster_art_lang: posterArtLang,
          spoiler_blur_enabled: spoilerBlurEnabled,
          poster_friends_watching: posterFriendsWatching,
          poster_friends_completed: posterFriendsCompleted,

          // Lecture & Hero
          auto_play_next: autoPlayNext,
          auto_play_single_source: autoPlaySingleSource,
          auto_play_min_quality: autoPlayMinQuality,
          trailer_auto_play: trailerAutoPlay,
          trailer_sound_enabled: trailerSoundEnabled,
          trailer_fullscreen_enabled: trailerFullscreenEnabled,
          hero_overview_delay_seconds: heroOverviewDelaySeconds,
          hero_trailer_delay_seconds: heroTrailerDelaySeconds,
          hero_trailer_fullscreen_delay_seconds: heroTrailerFullscreenDelaySeconds,

          // Audio & Subtitles
          default_audio_language: defaultAudioLanguage,
          default_subtitle: defaultSubtitle,
          secondary_subtitle: secondarySubtitle,
          subtitle_size: subtitleSize,
          subtitle_color: subtitleColor,
          subtitle_style: subtitleStyle,
          subtitle_offset: subtitleOffset,
          filter_subtitles_by_language: filterSubtitlesByLanguage,
          subtitle_stylized: subtitleStylized,

          // Mobile
          mobile_nav_bar_style: mobileNavBarStyle,
          mobile_nav_glow_enabled: mobileNavGlowEnabled,
        }
      };

      const res = await fetch("/api/companion/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  }

  // Compression ultra-légère < 40 Ko pour Supabase Storage
  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedProfileId) return;

    setCoverUploading(true);
    try {
      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 960;
          let w = img.width;
          let h = img.height;
          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas error"));
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Compression failed"));
            },
            "image/jpeg",
            0.75
          );
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      const formData = new FormData();
      formData.append("file", compressedBlob, "cover.jpg");

      const res = await fetch(`/api/profiles/${selectedProfileId}/cover`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setCoverPreviewUrl(data.coverValue);
      }
    } catch (err) {
      console.error("Cover upload failed", err);
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec sélection du profil & bouton de sauvegarde */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Réglages TV & Mobile</h1>
            <p className="text-xs text-white/50">
              Synchronisation instantanée Nuvio-style (MegaSync) vers vos TV & téléphones.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {profiles.length > 0 && (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xs text-white/60 font-medium">Profil :</span>
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
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Enregistrement...
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

      {/* Onglets de sections de réglages */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "appearance"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Palette className="h-4 w-4" /> Interface & Thème TV
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("posters")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "posters"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Film className="h-4 w-4" /> Posters & Accueil
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("playback")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "playback"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <PlaySquare className="h-4 w-4" /> Lecture & Continue Watching
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subtitles")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "subtitles"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Subtitles className="h-4 w-4" /> Sous-titres & Audio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("mobile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "mobile"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Smartphone className="h-4 w-4" /> Ergonomie Mobile
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-white/50 text-sm gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Chargement des préférences du profil...
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: INTERFACE & THÈME */}
          {activeTab === "appearance" && (
            <MegaSurface as="section" elevated className="space-y-6">
              {/* Couleur Focus D-Pad */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Couleur de Focus D-Pad TV</h3>
                    <p className="text-xs text-white/45">Bordure lumineuse qui entoure l&apos;élément sélectionné à la télécommande.</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                    {focusBorderColor}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {FOCUS_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setFocusBorderColor(c.name)}
                      className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${
                        focusBorderColor === c.name
                          ? "border-white bg-white/15 scale-105 shadow-lg shadow-indigo-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className="h-7 w-7 rounded-full border border-black/40 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] text-white/80 font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Mode Thème & OLED */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Thème d&apos;arrière-plan TV</h3>
                  <p className="text-xs text-white/45 mb-3">Fond d&apos;écran sombre ou noir absolu pour écrans OLED.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAppBackgroundMode("original");
                        setOledBlackBackground(false);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        appBackgroundMode === "original" && !oledBlackBackground
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Original Dark (#0D111A)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAppBackgroundMode("oled_black");
                        setOledBlackBackground(true);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        appBackgroundMode === "oled_black" || oledBlackBackground
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      OLED Noir Absolu (#000000)
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Écran de sélection de profil</h3>
                  <p className="text-xs text-white/45 mb-3">Effet visuel d&apos;ambiance sur le sélecteur de profil TV.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProfilePickerBackground("glow")}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        profilePickerBackground === "glow"
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Halo lumineux (Glow)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfilePickerBackground("illuminated")}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        profilePickerBackground === "illuminated"
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Illumination douce
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Toggles Ambiance & Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                  <input
                    type="checkbox"
                    checked={detailsAmbientColor}
                    onChange={(e) => setDetailsAmbientColor(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Couleurs d&apos;ambiance (Fiches)</span>
                    <span className="text-[11px] text-white/45">Arrière-plans adaptatifs aux posters</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                  <input
                    type="checkbox"
                    checked={megatvIntroAnimationEnabled}
                    onChange={(e) => setMegatvIntroAnimationEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Animation d&apos;introduction</span>
                    <span className="text-[11px] text-white/45">Splash screen animé au démarrage</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                  <input
                    type="checkbox"
                    checked={uiNavSoundsEnabled}
                    onChange={(e) => setUiNavSoundsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Sons de navigation TV</span>
                    <span className="text-[11px] text-white/45">Bips sonores lors du clic D-pad</span>
                  </div>
                </label>
              </div>

              {/* Format Horloge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  <span className="text-xs font-medium text-white">Format de l&apos;horloge TV</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setClockFormat("24h")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      clockFormat === "24h"
                        ? "border-indigo-400 bg-indigo-500/20 text-white"
                        : "border-white/10 text-white/60"
                    }`}
                  >
                    24 Heures (14:30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockFormat("12h")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      clockFormat === "12h"
                        ? "border-indigo-400 bg-indigo-500/20 text-white"
                        : "border-white/10 text-white/60"
                    }`}
                  >
                    12 Heures (2:30 PM)
                  </button>
                </div>
              </div>
            </MegaSurface>
          )}

          {/* TAB 2: POSTERS & ACCUEIL */}
          {activeTab === "posters" && (
            <MegaSurface as="section" elevated className="space-y-6">
              {/* Disposition Posters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Format des affiches (Posters)</h3>
                  <p className="text-xs text-white/45 mb-3">Choisir entre le format large moderne ou affiche cinéma verticale.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCardLayoutMode("landscape")}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        cardLayoutMode === "landscape"
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Paysage 16:9 (Moderne)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardLayoutMode("portrait")}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        cardLayoutMode === "portrait"
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Portrait 2:3 (Cinéma)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white">Rayon des coins : {posterCardRadiusDp} dp</h3>
                    <span className="text-xs font-mono text-indigo-400">{posterCardRadiusDp} dp</span>
                  </div>
                  <p className="text-xs text-white/45 mb-3">Arrondi des cartes de films et séries.</p>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="4"
                    value={posterCardRadiusDp}
                    onChange={(e) => setPosterCardRadiusDp(Number(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>0 dp (Carré)</span>
                    <span>16 dp</span>
                    <span>28 dp (Défaut)</span>
                    <span>32 dp (Rond)</span>
                  </div>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Photo de couverture de profil & Source Posters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Photo de couverture (Bannière profil)</h3>
                  <p className="text-xs text-white/45 mb-3">Image compressée ultra-légère (&lt; 40 Ko) synchronisée dans le Cloud.</p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs text-white cursor-pointer transition-all">
                      <Upload className="h-3.5 w-3.5" />
                      {coverUploading ? "Compression & Upload..." : "Téléverser une image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverFileChange}
                        disabled={coverUploading}
                      />
                    </label>
                    {coverPreviewUrl && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Couverture synchronisée
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Langue & Source des métadonnées</h3>
                  <p className="text-xs text-white/45 mb-3">Source TMDB pour les affiches et synopsis.</p>
                  <div className="flex gap-2">
                    <select
                      value={posterArtLang}
                      onChange={(e) => setPosterArtLang(e.target.value)}
                      className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="fr" className="bg-neutral-900">Français (FR)</option>
                      <option value="en" className="bg-neutral-900">Anglais (EN)</option>
                    </select>
                    <select
                      value={posterArtProvider}
                      onChange={(e) => setPosterArtProvider(e.target.value)}
                      className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="tmdb" className="bg-neutral-900">TMDB Officiel</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Toggles Sociales & Anti-Spoiler */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                  <input
                    type="checkbox"
                    checked={spoilerBlurEnabled}
                    onChange={(e) => setSpoilerBlurEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Flou anti-spoiler</span>
                    <span className="text-[11px] text-white/45">Floute les vignettes d&apos;épisodes non vus</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                  <input
                    type="checkbox"
                    checked={posterFriendsWatching}
                    onChange={(e) => setPosterFriendsWatching(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Amis en cours</span>
                    <span className="text-[11px] text-white/45">Badges des amis qui regardent</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                  <input
                    type="checkbox"
                    checked={posterFriendsCompleted}
                    onChange={(e) => setPosterFriendsCompleted(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Amis ayant terminé</span>
                    <span className="text-[11px] text-white/45">Badges de visionnage complet</span>
                  </div>
                </label>
              </div>
            </MegaSurface>
          )}

          {/* TAB 3: LECTURE & CONTINUE WATCHING */}
          {activeTab === "playback" && (
            <MegaSurface as="section" elevated className="space-y-6">
              {/* Autoplay & Continuer la lecture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Continuer la lecture (Continue Watching)</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                      <input
                        type="checkbox"
                        checked={autoPlayNext}
                        onChange={(e) => setAutoPlayNext(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-medium text-white block">Épisode suivant automatique</span>
                        <span className="text-[11px] text-white/45">Enchaîne directement la suite sans retour menu</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                      <input
                        type="checkbox"
                        checked={autoPlaySingleSource}
                        onChange={(e) => setAutoPlaySingleSource(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-medium text-white block">Lancer la source unique directement</span>
                        <span className="text-[11px] text-white/45">Évite le panneau de sélection si 1 seul flux</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                      <input
                        type="checkbox"
                        checked={cwPreferEpisodeThumbnail}
                        onChange={(e) => setCwPreferEpisodeThumbnail(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-medium text-white block">Vignette d&apos;épisode préférée</span>
                        <span className="text-[11px] text-white/45">Affiche la scène de l&apos;épisode au lieu de l&apos;affiche série</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Style de carte CW & Qualité min */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Style des cartes de reprise</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContinueWatchingCardStyle("carte")}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                          continueWatchingCardStyle === "carte"
                            ? "border-indigo-400 bg-indigo-500/20 text-white"
                            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Carte complète
                      </button>
                      <button
                        type="button"
                        onClick={() => setContinueWatchingCardStyle("banniere")}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                          continueWatchingCardStyle === "banniere"
                            ? "border-indigo-400 bg-indigo-500/20 text-white"
                            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Bannière compacte
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Qualité minimale pour l&apos;Autoplay</h3>
                    <select
                      value={autoPlayMinQuality}
                      onChange={(e) => setAutoPlayMinQuality(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Any" className="bg-neutral-900">Toutes qualités acceptées</option>
                      <option value="1080p" className="bg-neutral-900">1080p FHD minimum</option>
                      <option value="4K" className="bg-neutral-900">4K UHD minimum</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Bandes-annonces Hero TV */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Bandes-annonces à l&apos;accueil (Hero Trailer)</h3>
                <p className="text-xs text-white/45 mb-3">Comportement de la bande-annonce mise en avant sur la TV.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                    <input
                      type="checkbox"
                      checked={trailerAutoPlay}
                      onChange={(e) => setTrailerAutoPlay(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Lecture automatique</span>
                      <span className="text-[11px] text-white/45">Démarre la vidéo en haut d&apos;accueil</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                    <input
                      type="checkbox"
                      checked={trailerSoundEnabled}
                      onChange={(e) => setTrailerSoundEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Son de la bande-annonce</span>
                      <span className="text-[11px] text-white/45">Activer l&apos;audio d&apos;arrière-plan</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                    <input
                      type="checkbox"
                      checked={trailerFullscreenEnabled}
                      onChange={(e) => setTrailerFullscreenEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Plein écran automatique</span>
                      <span className="text-[11px] text-white/45">S&apos;étend après inactivité</span>
                    </div>
                  </label>
                </div>

                {/* Délais Hero */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80 font-medium">Délai avant démarrage vidéo</span>
                      <span className="font-mono text-indigo-400">{heroTrailerDelaySeconds} sec</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={heroTrailerDelaySeconds}
                      onChange={(e) => setHeroTrailerDelaySeconds(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80 font-medium">Délai avant plein écran</span>
                      <span className="font-mono text-indigo-400">{heroTrailerFullscreenDelaySeconds} sec</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="20"
                      value={heroTrailerFullscreenDelaySeconds}
                      onChange={(e) => setHeroTrailerFullscreenDelaySeconds(Number(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </MegaSurface>
          )}

          {/* TAB 4: SOUS-TITRES & AUDIO */}
          {activeTab === "subtitles" && (
            <MegaSurface as="section" elevated className="space-y-6">
              {/* Langues par défaut */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Piste audio par défaut</h3>
                  <p className="text-xs text-white/45 mb-2">Sélection prioritaire de la piste son.</p>
                  <select
                    value={defaultAudioLanguage}
                    onChange={(e) => setDefaultAudioLanguage(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="auto" className="bg-neutral-900">Automatique (Original)</option>
                    <option value="fr" className="bg-neutral-900">Français</option>
                    <option value="en" className="bg-neutral-900">Anglais</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Sous-titres principaux</h3>
                  <p className="text-xs text-white/45 mb-2">Activés d&apos;office si disponibles.</p>
                  <select
                    value={defaultSubtitle}
                    onChange={(e) => setDefaultSubtitle(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Off" className="bg-neutral-900">Désactivés</option>
                    <option value="French" className="bg-neutral-900">Français</option>
                    <option value="English" className="bg-neutral-900">Anglais</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Sous-titres secondaires</h3>
                  <p className="text-xs text-white/45 mb-2">Piste de secours si la principale manque.</p>
                  <select
                    value={secondarySubtitle}
                    onChange={(e) => setSecondarySubtitle(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Off" className="bg-neutral-900">Désactivés</option>
                    <option value="English" className="bg-neutral-900">Anglais</option>
                    <option value="French" className="bg-neutral-900">Français</option>
                  </select>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Rendu & Typographie des sous-titres */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Rendu & Apparence du texte</h3>
                <p className="text-xs text-white/45 mb-3">Taille, couleur et style visuel des sous-titres affichés à l&apos;écran.</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1.5 font-medium">Taille du texte</label>
                    <select
                      value={subtitleSize}
                      onChange={(e) => setSubtitleSize(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {SUBTITLE_SIZES.map((s) => (
                        <option key={s.value} value={s.value} className="bg-neutral-900">{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1.5 font-medium">Couleur du texte</label>
                    <select
                      value={subtitleColor}
                      onChange={(e) => setSubtitleColor(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {SUBTITLE_COLORS.map((c) => (
                        <option key={c.value} value={c.value} className="bg-neutral-900">{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1.5 font-medium">Style de police</label>
                    <select
                      value={subtitleStyle}
                      onChange={(e) => setSubtitleStyle(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Bold" className="bg-neutral-900">Gras (Recommandé)</option>
                      <option value="Normal" className="bg-neutral-900">Normal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1.5 font-medium">Position verticale</label>
                    <select
                      value={subtitleOffset}
                      onChange={(e) => setSubtitleOffset(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Low" className="bg-neutral-900">Bas (Standard)</option>
                      <option value="High" className="bg-neutral-900">Haut</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all flex-1">
                  <input
                    type="checkbox"
                    checked={subtitleStylized}
                    onChange={(e) => setSubtitleStylized(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Sous-titres stylisés (Ombres & Contour)</span>
                    <span className="text-[11px] text-white/45">Meilleure lisibilité sur fonds clairs</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all flex-1">
                  <input
                    type="checkbox"
                    checked={filterSubtitlesByLanguage}
                    onChange={(e) => setFilterSubtitlesByLanguage(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">Filtrer les pistes par langue</span>
                    <span className="text-[11px] text-white/45">Masque les langues inutiles</span>
                  </div>
                </label>
              </div>
            </MegaSurface>
          )}

          {/* TAB 5: ERGONOMIE MOBILE */}
          {activeTab === "mobile" && (
            <MegaSurface as="section" elevated className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Barre de navigation inférieure (Mobile)</h3>
                  <p className="text-xs text-white/45 mb-3">Style visuel de la barre de navigation sur smartphone et tablette.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileNavBarStyle("inline")}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        mobileNavBarStyle === "inline"
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Boutons Inclinés (Inline)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileNavBarStyle("stacked")}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        mobileNavBarStyle === "stacked"
                          ? "border-indigo-400 bg-indigo-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Empilés (Icône + Texte)
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Halo lumineux (Mobile Glow)</h3>
                  <p className="text-xs text-white/45 mb-3">Reflet dynamique sur la barre de navigation mobile.</p>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                    <input
                      type="checkbox"
                      checked={mobileNavGlowEnabled}
                      onChange={(e) => setMobileNavGlowEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-medium text-white block">Glow fluide actif</span>
                      <span className="text-[11px] text-white/45">Accentuation lumineuse en bas d&apos;écran</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Note sur l'isolation Per-Device */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200/80 leading-relaxed">
                  <span className="font-semibold text-white block mb-0.5">Isolation matérielle (Per-Device) préservée :</span>
                  Les réglages matériels locaux (ajustement de fréquence d&apos;images AFR, lecteur externe, boost sonore matériel, et serveurs DNS) restent spécifiques à chaque appareil physique et ne sont volontairement pas modifiés à distance pour garantir la compatibilité des écrans.
                </div>
              </div>
            </MegaSurface>
          )}
        </div>
      )}
    </div>
  );
}
