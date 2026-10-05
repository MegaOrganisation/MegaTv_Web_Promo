"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Moon, Sun, User as UserIcon, LogOut, Settings, Users, BarChart3, Check } from "lucide-react";
import { clsx } from "clsx";

import { MegaTvMark } from "@/components/ui/MegaTvMark";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { createClient } from "@/lib/supabase/client";

type MegaFloatingNavProps = {
  currentTab?: "home" | "premium" | "companion";
};

export function MegaFloatingNav({ currentTab }: MegaFloatingNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Try to read profile context if mounted inside CompanionProfileProvider
  let profileContext: ReturnType<typeof useCompanionProfile> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    profileContext = useCompanionProfile();
  } catch {
    profileContext = null;
  }

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine active tab if not passed explicitly
  const activeTab = currentTab || (pathname === "/" ? "home" : pathname.startsWith("/premium") ? "premium" : pathname.startsWith("/companion") ? "companion" : "home");

  // Sync theme with document element
  useEffect(() => {
    const current = document.documentElement.dataset.theme || "dark";
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  const [fallbackProfiles, setFallbackProfiles] = useState<any[]>([]);
  const [fallbackActiveProfileId, setFallbackActiveProfileId] = useState<string | null>(null);

  // Check auth state on client
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || null);
        if (!profileContext?.profiles?.length) {
          try {
            const { data } = await supabase
              .from("user_profiles")
              .select("id, user_id, name, avatar_color, avatar_id, avatar_image_version, avatar_image_storage_path, is_kids_profile, pin, is_locked, last_used_at, cover_type, cover_value")
              .eq("user_id", user.id)
              .order("last_used_at", { ascending: false, nullsFirst: false });
            if (data && data.length > 0) {
              const mapped = (data as any[]).map((p) => ({ ...p, profile_id: p.id }));
              setFallbackProfiles(mapped);
              const storedId = localStorage.getItem("megacompanion_active_profile_id");
              setFallbackActiveProfileId(storedId || mapped[0].profile_id);
            }
          } catch (_) {}
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || null);
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
        setFallbackProfiles([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [profileContext?.profiles?.length]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem("megacompanion_theme", next);
    } catch (_) {}
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setProfileDropdownOpen(false);
    router.replace("/");
    router.refresh();
  };

  const effectiveProfiles = profileContext?.profiles?.length ? profileContext.profiles : fallbackProfiles;
  const effectiveActiveProfile = profileContext?.activeProfile || effectiveProfiles.find(p => p.profile_id === fallbackActiveProfileId) || effectiveProfiles[0] || null;
  const profileAvatarUrls = profileContext?.profileAvatarUrlsById || {};

  const displayName = effectiveActiveProfile?.name || (userEmail ? userEmail.split("@")[0] : "Mon Compte");

  const getProfileAvatarSrc = (profile: any) => {
    if (!profile) return null;
    if (profileAvatarUrls[profile.profile_id]) {
      return profileAvatarUrls[profile.profile_id];
    }
    if ((profile.avatar_image_version || 0) > 0 || profile.avatar_image_storage_path) {
      const p = profile.avatar_image_storage_path?.trim();
      if (p && (p.startsWith("http://") || p.startsWith("https://"))) return p;
      return `/api/profiles/${encodeURIComponent(profile.profile_id)}/avatar?v=${profile.avatar_image_version || 1}`;
    }
    if (profile.avatar_id && profile.avatar_id > 0) {
      const num = Math.min(Math.max(profile.avatar_id, 1), 20);
      return `/assets/avatars/avatar_${num}.png`;
    }
    return null;
  };

  const activeAvatarSrc = getProfileAvatarSrc(effectiveActiveProfile);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[96vw]">
      <div className="flex items-center gap-2 sm:gap-4 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#12141c]/85 dark:bg-[#12141c]/90 light:bg-white/90 backdrop-blur-2xl border border-white/12 dark:border-white/14 shadow-[0_18px_45px_rgba(0,0,0,0.6)] transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 pl-1 pr-2 hover:opacity-90 transition-opacity">
          <MegaTvMark size={28} />
          <span className="font-bold tracking-tight text-sm sm:text-base text-white">MegaTv</span>
        </Link>

        {/* Center Pill Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <Link
            href="/"
            className={clsx(
              "px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all",
              activeTab === "home"
                ? "bg-white text-black shadow-sm font-bold"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            Home
          </Link>
          <Link
            href="/premium"
            className={clsx(
              "px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all",
              activeTab === "premium"
                ? "bg-white text-black shadow-sm font-bold"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            Premium
          </Link>
          <Link
            href="/companion"
            className={clsx(
              "px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all",
              activeTab === "companion"
                ? "bg-white text-black shadow-sm font-bold"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            Compagnon
          </Link>
        </nav>

        {/* Right Section: Theme Toggle + Profile / Login */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-3 border-l border-white/10">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Changer de thème"
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User Profile or Login Button */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-white/8 transition-colors"
              >
                {activeAvatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeAvatarSrc}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover ring-1.5 ring-white/25 shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-[11px] font-bold text-white uppercase ring-1.5 ring-white/25 shrink-0">
                    {displayName[0] || "U"}
                  </div>
                )}
                <span className="text-xs sm:text-sm font-medium text-white max-w-[90px] sm:max-w-[130px] truncate">
                  {displayName}
                </span>
                <ChevronDown size={14} className="text-white/50" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#14161f]/95 backdrop-blur-2xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 text-white z-[110] animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/8 mb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Compte Connecté</p>
                    <p className="text-xs font-medium text-white/90 truncate">{userEmail || "Connecté"}</p>
                    {effectiveActiveProfile && (
                      <p className="text-xs text-indigo-400 font-semibold mt-0.5">Profil actif : {effectiveActiveProfile.name}</p>
                    )}
                  </div>

                  {effectiveProfiles.length > 1 && (
                    <div className="py-1 border-b border-white/8 mb-1">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">Changer de profil</p>
                      {effectiveProfiles.map((p) => {
                        const isCurrent = p.profile_id === effectiveActiveProfile?.profile_id;
                        const pAvatar = getProfileAvatarSrc(p);
                        return (
                          <button
                            key={p.profile_id}
                            type="button"
                            onClick={() => {
                              if (profileContext?.setActiveProfileId) {
                                profileContext.setActiveProfileId(p.profile_id);
                              } else {
                                setFallbackActiveProfileId(p.profile_id);
                                try {
                                  localStorage.setItem("megacompanion_active_profile_id", p.profile_id);
                                } catch (_) {}
                              }
                              setProfileDropdownOpen(false);
                            }}
                            className={clsx(
                              "w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors",
                              isCurrent ? "bg-white/10 text-white font-semibold" : "text-white/70 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {pAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={pAvatar} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20 shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                                  {p.name?.[0] || "U"}
                                </div>
                              )}
                              <span className="truncate">{p.name}</span>
                            </div>
                            {isCurrent && <Check size={13} className="text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <Link
                      href="/companion"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <BarChart3 size={14} className="text-indigo-400" />
                      Tableau de bord Compagnon
                    </Link>
                    <Link
                      href="/companion/profiles"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <Users size={14} className="text-teal-400" />
                      Gérer les profils
                    </Link>
                    <Link
                      href="/companion/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <Settings size={14} className="text-amber-400" />
                      Paramètres & Cloud
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/18 text-white transition-colors"
            >
              <UserIcon size={14} />
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
