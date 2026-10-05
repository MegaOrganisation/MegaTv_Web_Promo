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
              .from("profiles")
              .select("*")
              .eq("account_id", user.id)
              .order("created_at", { ascending: true });
            if (data && data.length > 0) {
              setFallbackProfiles(data);
              const storedId = localStorage.getItem("megacompanion_active_profile_id");
              setFallbackActiveProfileId(storedId || data[0].profile_id);
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

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] max-w-[96vw]">
      <div className="flex items-center gap-1.5 sm:gap-3 px-3 py-1.5 rounded-full bg-[#12141c]/80 dark:bg-[#12141c]/90 light:bg-white/90 backdrop-blur-2xl border border-white/10 dark:border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.55)] transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 pl-1 pr-2 hover:opacity-90 transition-opacity">
          <MegaTvMark size={24} />
          <span className="font-bold tracking-tight text-sm sm:text-base text-white">MegaTv</span>
        </Link>

        {/* Center Pill Nav Links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={clsx(
              "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all",
              activeTab === "home"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            Home
          </Link>
          <Link
            href="/premium"
            className={clsx(
              "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all",
              activeTab === "premium"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            Premium
          </Link>
          <Link
            href="/companion"
            className={clsx(
              "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all",
              activeTab === "companion"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            Compagnon
          </Link>
        </nav>

        {/* Right Section: Theme Toggle + Profile / Login */}
        <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-white/10">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Changer de thème"
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User Profile or Login Button */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-full hover:bg-white/8 transition-colors"
              >
                {effectiveActiveProfile?.avatar_id && profileAvatarUrls[effectiveActiveProfile.profile_id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileAvatarUrls[effectiveActiveProfile.profile_id]}
                    alt={displayName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white uppercase ring-1 ring-white/20">
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
                            <span className="truncate">{p.name}</span>
                            {isCurrent && <Check size={13} className="text-emerald-400" />}
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
