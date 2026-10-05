"use client";

import { useEffect, useState } from "react";
import { Sparkles, Palette, Monitor, Film, Sliders, Check, RefreshCw, Upload, Volume2 } from "lucide-react";
import { MegaSurface } from "@/features/companion/ui/MegaSurface";

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

export function CompanionProfileSettingsSection() {
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings state
  const [focusBorderColor, setFocusBorderColor] = useState("White");
  const [appBackgroundMode, setAppBackgroundMode] = useState("original");
  const [cardLayoutMode, setCardLayoutMode] = useState("landscape");
  const [posterCardRadiusDp, setPosterCardRadiusDp] = useState(28);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [defaultSubtitle, setDefaultSubtitle] = useState("Off");
  const [defaultSubLang, setDefaultSubLang] = useState("Off");
  const [defaultSubForced, setDefaultSubForced] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Load profiles on mount
  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch("/api/profiles/active");
        if (res.ok) {
          const data = await res.json();
          if (data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles);
            setSelectedProfileId(data.activeProfileId || data.profiles[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load profiles", err);
      }
    }
    loadProfiles();
  }, []);

  // Load settings when selected profile changes
  useEffect(() => {
    if (!selectedProfileId) return;
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch(`/api/companion/settings?profileId=${selectedProfileId}`);
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || {};
          if (s.focus_border_color) setFocusBorderColor(s.focus_border_color);
          if (s.app_background_mode) setAppBackgroundMode(s.app_background_mode);
          if (s.card_layout_mode) setCardLayoutMode(s.card_layout_mode);
          if (s.poster_card_radius_dp !== undefined) setPosterCardRadiusDp(Number(s.poster_card_radius_dp));
          if (s.auto_play_next !== undefined) setAutoPlayNext(Boolean(s.auto_play_next));
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
          focus_border_color: focusBorderColor,
          app_background_mode: appBackgroundMode,
          oled_black_background: appBackgroundMode === "oled_black",
          card_layout_mode: cardLayoutMode,
          poster_card_radius_dp: posterCardRadiusDp,
          auto_play_next: autoPlayNext,
          default_subtitle: defaultSubtitle,
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

  // Client-side ultra-low weight cover compression & upload
  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedProfileId) return;

    setCoverUploading(true);
    try {
      // Compress canvas client-side to max 960x540 at 80% JPEG (< 50 Ko)
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
          if (!ctx) return reject(new Error("Canvas context failed"));
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Compression failed"));
            },
            "image/jpeg",
            0.8
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
    <MegaSurface as="section" elevated className="mega-cinema-settings-grid__wide">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="mega-metric-icon-wrap">
            <Sliders className="h-5 w-5 text-indigo-400" strokeWidth={2} />
          </div>
          <div>
            <h2 className="mega-cinema-display text-lg text-white">Réglages TV & Mobile (MegaSync Instantané)</h2>
            <p className="mt-0.5 text-xs text-white/45">
              Ajustez vos préférences ici : synchronisation instantanée en direct et à l&apos;allumage.
            </p>
          </div>
        </div>

        {profiles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Profil :</span>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white border border-white/15 focus:outline-none"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-white/50 text-sm gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" /> Chargement des réglages...
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {/* Couleur Focus D-Pad TV */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-white/70" />
              <label className="text-xs font-semibold uppercase tracking-wider text-white/75">
                Couleur de Focus D-Pad TV
              </label>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {FOCUS_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setFocusBorderColor(c.name)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                    focusBorderColor === c.name
                      ? "border-white bg-white/15 scale-105 shadow-lg"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div
                    className="h-6 w-6 rounded-full border border-black/30 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[11px] text-white/80">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Arrière-plan & Mode OLED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="h-4 w-4 text-white/70" />
                <label className="text-xs font-semibold uppercase tracking-wider text-white/75">
                  Thème d&apos;arrière-plan
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAppBackgroundMode("original")}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    appBackgroundMode === "original"
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  Original Dark (#0D111A)
                </button>
                <button
                  type="button"
                  onClick={() => setAppBackgroundMode("oled_black")}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    appBackgroundMode === "oled_black"
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  OLED Noir Pur (#000000)
                </button>
              </div>
            </div>

            {/* Disposition & Rayon Posters */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Film className="h-4 w-4 text-white/70" />
                <label className="text-xs font-semibold uppercase tracking-wider text-white/75">
                  Format des affiches (Posters)
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCardLayoutMode("landscape")}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    cardLayoutMode === "landscape"
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  Paysage 16:9
                </button>
                <button
                  type="button"
                  onClick={() => setCardLayoutMode("portrait")}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    cardLayoutMode === "portrait"
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  Portrait 2:3
                </button>
              </div>
            </div>
          </div>

          {/* Arrondi des coins & Photo de couverture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/75 block mb-2">
                Rayon des coins : {posterCardRadiusDp} dp
              </label>
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

            {/* Photo de couverture optimisée */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/75 block mb-2">
                Photo de couverture (Bannière profil)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs text-white cursor-pointer transition-all">
                  <Upload className="h-3.5 w-3.5" />
                  {coverUploading ? "Compression & Upload..." : "Changer l'image (max 50 Ko)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileChange}
                    disabled={coverUploading}
                  />
                </label>
                {coverPreviewUrl && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Couverture synchronisée
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sous-titres (Langue puis Forced) */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-white/70" />
                <label className="text-xs font-semibold uppercase tracking-wider text-white/75">
                  Sous-titres par défaut
                </label>
              </div>
              {defaultSubLang !== "Off" && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  defaultSubForced
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}>
                  {defaultSubForced ? "Forcés uniquement" : "Complets"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Choix 1 : Langue */}
              <div>
                <label className="text-[11px] text-white/60 block mb-1.5 font-medium">
                  1. Sélectionner la langue
                </label>
                <select
                  value={defaultSubLang}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setDefaultSubLang(newLang);
                    setDefaultSubtitle(formatSubtitleValue(newLang, defaultSubForced));
                  }}
                  className="w-full rounded-lg bg-neutral-900 border border-white/15 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {SUBTITLE_LANGUAGES.map((sl) => (
                    <option key={sl.value} value={sl.value} className="bg-neutral-900 text-white">
                      {sl.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Choix 2 : Forcé ou non */}
              <div>
                <label className="text-[11px] text-white/60 block mb-1.5 font-medium">
                  2. Type de piste
                </label>
                {defaultSubLang === "Off" ? (
                  <div className="h-[38px] flex items-center px-3 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white/40 italic">
                    Désactivé (aucun sous-titre)
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDefaultSubForced(false);
                        setDefaultSubtitle(formatSubtitleValue(defaultSubLang, false));
                      }}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
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
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                        defaultSubForced
                          ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-sm"
                          : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      Forcés (Forced) ✓
                    </button>
                  </div>
                )}
              </div>
            </div>

            {defaultSubLang !== "Off" && (
              <p className="text-[10px] text-white/40 leading-relaxed pt-1">
                {defaultSubForced
                  ? "Seulement pour les dialogues en langue étrangère (ex: scènes traduites dans un film VF)."
                  : "Sous-titres affichés en permanence pour l'intégralité du programme."}
              </p>
            )}
          </div>

          {/* Lecture (Autoplay) & Sauvegarde */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <input
                id="autoplay_next"
                type="checkbox"
                checked={autoPlayNext}
                onChange={(e) => setAutoPlayNext(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="autoplay_next" className="text-xs text-white/80 cursor-pointer">
                Enchaîner automatiquement l&apos;épisode suivant (Autoplay)
              </label>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
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
                  <Sparkles className="h-3.5 w-3.5" /> Enregistrer & Synchroniser TV
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </MegaSurface>
  );
}
