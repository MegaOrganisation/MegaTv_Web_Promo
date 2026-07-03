"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { Bookmark, Home, LogOut, Search, Settings, Tv, UsersRound, type LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { PresetAvatarCircle } from "@/features/dashboard/PresetAvatarCircle";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { createClient } from "@/lib/supabase/client";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const navItems: NavItem[] = [
  { href: "/web/home", label: "Accueil", icon: Home, exact: true },
  { href: "/web/search", label: "Recherche", icon: Search },
  { href: "/web/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/web/tv", label: "TV en direct", icon: Tv },
  { href: "/web/settings", label: "Réglages", icon: Settings }
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function WebShellNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeProfile, withProfile } = useWebProfile();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      {/* Desktop: hover-expand left rail */}
      <div className="peer/nav group/nav fixed bottom-4 left-4 top-4 z-40 hidden w-[4.25rem] flex-col transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:w-60 focus-within:w-60 lg:flex">
        <Link
          href={withProfile("/web/home")}
          className="focus-ring mb-2 flex h-11 shrink-0 items-center gap-2.5 overflow-hidden rounded-2xl px-2 transition group-hover/nav:justify-start group-focus-within/nav:justify-start justify-center"
        >
          <Image src="/assets/mark.png" alt="MegaTv" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
          <span className="max-w-0 truncate text-sm font-bold tracking-tight text-[var(--mega-text)] opacity-0 transition-all duration-300 group-hover/nav:max-w-[10rem] group-hover/nav:opacity-100 group-focus-within/nav:max-w-[10rem] group-focus-within/nav:opacity-100">
            MegaTv
          </span>
        </Link>

        <aside
          aria-label="Navigation MegaTv Web"
          className="flex min-h-0 flex-1 flex-col overflow-visible rounded-[26px] border border-[var(--mega-border)] bg-[var(--mega-shell-nav)] p-2 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
        >
          <Link
            href="/web"
            className="focus-ring relative z-20 mb-1 flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-[var(--mega-card-bg)] group-hover/nav:justify-start group-focus-within/nav:justify-start justify-center"
            title="Changer de profil"
          >
            {activeProfile ? (
              <PresetAvatarCircle avatarId={activeProfile.avatar_id || 1} size="sm" label={activeProfile.name || "Profil"} />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#3f9ae6,#d8497f)] text-white">
                <UsersRound className="h-4 w-4" />
              </span>
            )}
            <span className="min-w-0 max-w-0 truncate text-sm font-semibold text-[var(--mega-text-muted)] opacity-0 transition-all duration-300 group-hover/nav:max-w-[9rem] group-hover/nav:opacity-100 group-focus-within/nav:max-w-[9rem] group-focus-within/nav:opacity-100">
              {activeProfile?.name || "Profil"}
            </span>
          </Link>

          <nav className="min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={withProfile(item.href)}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "focus-ring flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold transition",
                    active
                      ? "bg-[var(--mega-card-bg)] text-[var(--mega-text)] shadow-[inset_0_0_0_1px_var(--mega-border-strong)]"
                      : "text-[var(--mega-text-muted)] hover:bg-[var(--mega-card-bg)] hover:text-[var(--mega-text)]"
                  )}
                >
                  <Icon
                    className={clsx("mx-auto h-[1.15rem] w-[1.15rem] shrink-0 transition group-hover/nav:mx-0 group-focus-within/nav:mx-0")}
                    fill={active ? "currentColor" : "none"}
                    strokeWidth={active ? 2.6 : 2}
                  />
                  <span className="min-w-0 truncate whitespace-nowrap opacity-0 transition duration-200 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={signOut}
            className="focus-ring mx-1 mt-2 flex w-[calc(100%-0.5rem)] shrink-0 items-center gap-2 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-2.5 py-2.5 text-sm font-semibold text-[var(--mega-text-muted)] transition hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
          >
            <LogOut className="mx-auto h-4 w-4 shrink-0 transition group-hover/nav:mx-0 group-focus-within/nav:mx-0" />
            <span className="min-w-0 truncate whitespace-nowrap opacity-0 transition duration-200 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">
              Se déconnecter
            </span>
          </button>
        </aside>
      </div>

      {/* Mobile: bottom nav */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <nav className="pointer-events-auto mx-auto grid w-full max-w-md grid-cols-5 gap-1 rounded-[24px] border border-[var(--mega-border)] bg-[var(--mega-shell-nav)] p-1.5 backdrop-blur-2xl">
          {navItems.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={`${item.href}-m`}
                href={withProfile(item.href)}
                prefetch
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "focus-ring flex min-w-0 flex-col items-center gap-1 rounded-[18px] px-1 py-2 text-[10px] font-semibold transition",
                  active ? "bg-[var(--mega-card-bg)] text-[var(--mega-text)]" : "text-[var(--mega-text-faint)] hover:text-[var(--mega-text)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" fill={active ? "currentColor" : "none"} strokeWidth={active ? 2.6 : 2} />
                <span className="block w-full truncate text-center leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
