"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { UsersRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { PresetAvatarCircle } from "@/features/dashboard/PresetAvatarCircle";
import { RouteTransition } from "@/features/web/RouteTransition";
import { MegaTvIcon, type MegaTvIconName } from "@/features/web/icons/MegaTvIcon";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs, type WebNavLayout } from "@/lib/web/prefs";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  href: string;
  label: string;
  icon: MegaTvIconName;
  exact?: boolean;
  /** When true, rendered in the separate settings pill on horizontal layout. */
  settingsSlot?: boolean;
};

/** Horizontal top bar order mirrors Android [AppTopBar] (Search → Home → Watchlist → TV). */
const MAIN_NAV: NavItem[] = [
  { href: "/web/search", label: "Recherche", icon: "search" },
  { href: "/web/home", label: "Accueil", icon: "home", exact: true },
  { href: "/web/watchlist", label: "Watchlist", icon: "bookmark" },
  { href: "/web/tv", label: "TV en direct", icon: "tv" }
];

const SETTINGS_NAV: NavItem = {
  href: "/web/settings",
  label: "Réglages",
  icon: "settings",
  settingsSlot: true
};

/** Mobile bottom bar order (Home first). */
const MOBILE_NAV: NavItem[] = [
  { href: "/web/home", label: "Accueil", icon: "home", exact: true },
  { href: "/web/search", label: "Recherche", icon: "search" },
  { href: "/web/watchlist", label: "Watchlist", icon: "bookmark" },
  { href: "/web/tv", label: "TV en direct", icon: "tv" },
  SETTINGS_NAV
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function ProfileAvatarLink({ className, size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const { activeProfile } = useWebProfile();
  const dim = size === "md" ? "h-10 w-10" : "h-9 w-9";

  return (
    <Link
      href="/web?switch=1"
      className={clsx("mega-profile-ring focus-ring shrink-0 transition", className)}
      title="Changer de profil"
    >
      {activeProfile ? (
        <PresetAvatarCircle avatarId={activeProfile.avatar_id || 1} size={size} label={activeProfile.name || "Profil"} />
      ) : (
        <span className={clsx("grid place-items-center rounded-full bg-[linear-gradient(135deg,#3f9ae6,#d8497f)] text-white", dim)}>
          <UsersRound className="h-4 w-4" />
        </span>
      )}
    </Link>
  );
}

function NavChip({
  item,
  active,
  showLabel = "hover",
  className
}: {
  item: NavItem;
  active: boolean;
  /** "hover" expands label on hover/focus; "rail" uses parent group-hover; "always" for mobile. */
  showLabel?: "hover" | "rail" | "always" | "never";
  className?: string;
}) {
  const { withProfile } = useWebProfile();

  return (
    <Link
      href={withProfile(item.href)}
      prefetch
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={clsx(
        "mega-nav-chip focus-ring",
        active && "mega-nav-chip-active",
        showLabel === "hover" && "mega-nav-chip-expand",
        showLabel === "rail" && "mega-nav-chip-rail",
        showLabel === "always" && "mega-nav-chip-mobile",
        className
      )}
    >
      <MegaTvIcon name={item.icon} filled={active} className="h-[1.15rem] w-[1.15rem]" />
      <span className="mega-nav-chip-label">{item.label}</span>
    </Link>
  );
}

function HorizontalTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeProfile } = useWebProfile();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <header className={clsx("fixed left-0 right-0 top-0 z-40 hidden lg:block", scrolled && "mega-topnav-scrolled")}>
      <div className="mega-topnav-scrim pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex max-w-[1500px] items-center gap-4 px-6 py-3">
        <ProfileAvatarLink size="md" className="pointer-events-auto" />

        <div className="pointer-events-auto flex flex-1 items-center gap-3">
          <nav aria-label="Navigation principale" className="mega-nav-glass flex items-center gap-0.5 rounded-full p-1.5">
            {MAIN_NAV.map((item) => (
              <NavChip key={item.href} item={item} active={isActive(pathname, item)} showLabel="hover" />
            ))}
          </nav>

          <nav aria-label="Réglages" className="mega-nav-glass rounded-full p-1.5">
            <NavChip item={SETTINGS_NAV} active={isActive(pathname, SETTINGS_NAV)} showLabel="hover" />
          </nav>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {activeProfile ? (
            <span className="max-w-[9rem] truncate text-sm font-semibold text-[var(--mega-text-muted)]">{activeProfile.name}</span>
          ) : null}
          <button
            type="button"
            onClick={signOut}
            aria-label="Se déconnecter"
            className="focus-ring mega-nav-glass grid h-10 w-10 place-items-center rounded-full text-[var(--mega-text-muted)] transition hover:text-[var(--mega-text)]"
          >
            <MegaTvIcon name="logout" className="h-[1.15rem] w-[1.15rem]" />
          </button>
        </div>
      </div>
    </header>
  );
}

function VerticalSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeProfile } = useWebProfile();
  const allItems = [...MAIN_NAV, SETTINGS_NAV];

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="peer/nav group/nav fixed left-3 top-3 z-40 hidden w-[4.25rem] flex-col transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:w-[15rem] focus-within:w-[15rem] lg:flex">
      <aside
        aria-label="Navigation MegaTv Web"
        className="mega-nav-glass flex min-h-0 max-h-[calc(100vh-1.5rem)] flex-col overflow-visible rounded-[26px] p-2 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]"
      >
        <div className="mb-2 flex shrink-0 justify-center px-1 py-1 group-hover/nav:justify-start group-focus-within/nav:justify-start">
          <ProfileAvatarLink />
        </div>

        {activeProfile ? (
          <p className="mb-1 max-h-0 truncate px-2 text-xs font-semibold text-[var(--mega-text-faint)] opacity-0 transition-all duration-300 group-hover/nav:max-h-5 group-hover/nav:opacity-100 group-focus-within/nav:max-h-5 group-focus-within/nav:opacity-100">
            {activeProfile.name}
          </p>
        ) : null}

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-0.5">
          {allItems.map((item) => (
            <NavChip key={item.href} item={item} active={isActive(pathname, item)} showLabel="rail" className="w-full" />
          ))}
        </nav>

        <button
          type="button"
          onClick={signOut}
          className="focus-ring mega-nav-chip mega-nav-chip-rail mt-2 w-full text-[var(--mega-text-muted)] hover:text-[var(--mega-text)]"
        >
          <MegaTvIcon name="logout" className="h-[1.15rem] w-[1.15rem]" />
          <span className="mega-nav-chip-label">Se déconnecter</span>
        </button>
      </aside>
    </div>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const { withProfile } = useWebProfile();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <nav className="pointer-events-auto mega-nav-glass mx-auto grid w-full max-w-md grid-cols-5 gap-0.5 rounded-[24px] p-1.5">
        {MOBILE_NAV.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={`${item.href}-m`}
              href={withProfile(item.href)}
              prefetch
              aria-current={active ? "page" : undefined}
              className={clsx(
                "focus-ring flex min-w-0 flex-col items-center justify-center rounded-[18px] px-1 py-2 text-[10px] font-semibold transition-colors duration-300",
                active ? "bg-[var(--mega-card-bg)] text-[var(--mega-text)]" : "text-[var(--mega-text-faint)] hover:text-[var(--mega-text)]"
              )}
            >
              <MegaTvIcon
                name={item.icon}
                filled={active}
                className={clsx(
                  "h-6 w-6 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active ? "-translate-y-0.5 scale-[0.8]" : "scale-100"
                )}
              />
              <span
                className={clsx(
                  "block w-full overflow-hidden truncate text-center leading-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active ? "mt-0.5 max-h-4 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Renders desktop nav (vertical or horizontal) + mobile bottom bar. */
export function WebShellNav({ layout }: { layout: WebNavLayout }) {
  return (
    <>
      {layout === "horizontal" ? <HorizontalTopNav /> : <VerticalSideNav />}
      <MobileBottomNav />
    </>
  );
}

/** Client shell: nav + responsive main padding (vertical rail expand / horizontal top bar). */
export function WebAppChrome({ children }: { children: ReactNode }) {
  const { activeProfileId } = useWebProfile();
  const { prefs } = useWebPrefs(activeProfileId);
  const vertical = prefs.navLayout === "vertical";

  return (
    <div className="min-h-screen">
      <WebShellNav layout={prefs.navLayout} />
      <main
        className={clsx(
          "mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-6 lg:pb-10 lg:pr-8",
          vertical
            ? "lg:pl-[5.75rem] lg:peer-hover/nav:pl-[17.25rem] lg:peer-focus-within/nav:pl-[17.25rem]"
            : "lg:pl-8 lg:pt-[5.5rem]"
        )}
      >
        <RouteTransition>{children}</RouteTransition>
      </main>
    </div>
  );
}
