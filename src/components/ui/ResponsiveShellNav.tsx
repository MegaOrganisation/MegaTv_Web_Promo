"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { Bookmark, Home, LayoutGrid, LogOut, MonitorSmartphone, Settings, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { GlobalProfileSelector } from "@/features/companion/GlobalProfileSelector";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  exact?: boolean;
};

const baseItems: NavItem[] = [
  { href: "/companion", label: "Dashboard", shortLabel: "Home", icon: Home, exact: true },
  { href: "/companion/manage", label: "Gérer", shortLabel: "Gérer", icon: LayoutGrid },
  { href: "/companion/watchlist", label: "Watchlist", shortLabel: "List", icon: Bookmark },
  { href: "/companion/profiles", label: "Profils", shortLabel: "Profils", icon: UserRound },
  { href: "/companion/devices", label: "Appareils", shortLabel: "App.", icon: MonitorSmartphone },
  { href: "/companion/settings", label: "Réglages", shortLabel: "Régl.", icon: Settings, exact: true }
];

const adminItem: NavItem = { href: "/companion/admin", label: "Admin", shortLabel: "Admin", icon: ShieldCheck, exact: true };

export function DesktopCompanionNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const activeHash = useActiveHash();
  const router = useRouter();
  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="peer/nav group/nav fixed bottom-4 left-4 top-4 z-40 hidden w-[4.25rem] flex-col transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:w-64 focus-within:w-64 lg:flex">
      <Link
        href="/"
        className="focus-ring mb-2 flex h-11 shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-2 transition-[justify-content] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/nav:justify-start group-focus-within/nav:justify-start"
      >
        <Image src="/assets/mark.png" alt="MegaTv" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
        <span className="max-w-0 truncate text-sm font-bold tracking-tight text-[var(--mega-text)] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/nav:max-w-[11rem] group-hover/nav:opacity-100 group-focus-within/nav:max-w-[11rem] group-focus-within/nav:opacity-100">
          MegaCompagnon
        </span>
      </Link>

      <aside
        aria-label="Navigation MegaCompagnon"
        className="companion-nav flex min-h-0 flex-1 flex-col overflow-visible rounded-[26px] border border-[var(--mega-border)] bg-[var(--mega-shell-nav)] p-2 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      >
        <div className="relative z-20 flex shrink-0 justify-center px-1 py-2 group-hover/nav:justify-start group-focus-within/nav:justify-start">
          <div className="grid h-11 w-11 place-items-center">
            <GlobalProfileSelector menuPlacement="sidebar" />
          </div>
        </div>
        <div className="mb-1 min-w-0 shrink-0 px-1 opacity-0 transition duration-200 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">
          <p className="truncate text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mega-text-faint)]">Profil actif</p>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, activeHash, item)} variant="desktop" />
          ))}
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
  );
}

export function MobileCompanionChrome({
  isAdmin = false,
  headerEnd,
  docked = false,
  profileAnchor
}: {
  isAdmin?: boolean;
  headerEnd?: ReactNode;
  docked?: boolean;
  profileAnchor?: ReactNode;
}) {
  return (
    <header
      className={clsx(
        "companion-mobile-header pointer-events-none fixed inset-x-0 top-0 z-[90] w-full max-w-[100vw] border-b border-[var(--mega-border)] bg-[var(--mega-shell-nav)] backdrop-blur-2xl transition-[box-shadow] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
        docked && "shadow-[0_12px_40px_-24px_rgba(0,0,0,0.8)]"
      )}
    >
      <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-3 px-3 py-2.5 pt-[max(0.65rem,env(safe-area-inset-top))]">
        <Link href="/" className="focus-ring flex min-w-0 items-center gap-2 rounded-2xl">
          <Image src="/assets/mark.png" alt="MegaTv" width={34} height={34} className="h-9 w-9 shrink-0 rounded-lg" />
          <span
            className={clsx(
              "min-w-0 truncate text-sm font-bold text-[var(--mega-text)] transition-all duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-base",
              docked ? "max-w-[6.5rem] opacity-90" : "max-w-[10rem] opacity-100"
            )}
          >
            MegaCompagnon
          </span>
        </Link>
        <div className="flex shrink-0 items-center">
          <div
            className={clsx(
              "flex items-center gap-2 overflow-hidden transition-all duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              docked ? "max-w-[12rem] translate-x-0 opacity-100" : "max-w-0 translate-x-2 opacity-0"
            )}
          >
            {headerEnd ? <div className="shrink-0 transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]">{headerEnd}</div> : null}
            {isAdmin ? (
              <Link
                href="/companion/admin"
                className="focus-ring inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 text-xs font-semibold text-[var(--mega-text)]"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            ) : null}
          </div>
          <div className="shrink-0 transition-all duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]">{profileAnchor}</div>
        </div>
      </div>
    </header>
  );
}

export function MobileCompanionNav() {
  const pathname = usePathname();
  const activeHash = useActiveHash();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <nav className="companion-mobile-nav pointer-events-auto mx-auto grid w-full max-w-md grid-cols-6 gap-1 rounded-[24px] border border-[var(--mega-border)] bg-[var(--mega-shell-nav)] p-1.5 backdrop-blur-2xl">
      {baseItems.map((item) => (
        <NavLink key={`${item.href}-mobile`} item={item} active={isActive(pathname, activeHash, item)} variant="mobile" />
      ))}
      </nav>
    </div>
  );
}

function NavLink({ item, active, variant }: { item: NavItem; active: boolean; variant: "desktop" | "mobile" }) {
  const Icon = item.icon;
  const { withProfile } = useCompanionProfile();
  const href = withProfile(item.href);

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        prefetch
        aria-current={active ? "page" : undefined}
        className={clsx(
          "focus-ring flex min-w-0 flex-col items-center gap-1 rounded-[18px] px-1 py-2 text-[10px] font-semibold transition sm:text-[11px]",
          active ? "bg-[var(--mega-card-bg)] text-[var(--mega-text)]" : "text-[var(--mega-text-faint)] hover:bg-[var(--mega-card-bg)] hover:text-[var(--mega-text)]"
        )}
      >
        <Icon className={clsx("h-4 w-4 shrink-0", active ? "text-[var(--mega-text)]" : "text-[var(--mega-text-muted)]")} fill={active ? "currentColor" : "none"} strokeWidth={active ? 2.8 : 2} />
        <span className="block w-full truncate text-center leading-none">{item.shortLabel}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      prefetch
      aria-current={active ? "page" : undefined}
      className={clsx(
        "focus-ring flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-[var(--mega-card-bg)] text-[var(--mega-text)] shadow-[inset_0_0_0_1px_var(--mega-border-strong)]"
          : "text-[var(--mega-text-muted)] hover:bg-[var(--mega-card-bg)] hover:text-[var(--mega-text)]"
      )}
    >
      <Icon className={clsx("mx-auto h-[1.15rem] w-[1.15rem] shrink-0 transition group-hover/nav:mx-0 group-focus-within/nav:mx-0", active ? "text-[var(--mega-text)]" : "text-[var(--mega-text-muted)]")} fill={active ? "currentColor" : "none"} strokeWidth={active ? 2.8 : 2} />
      <span className="min-w-0 truncate whitespace-nowrap opacity-0 transition duration-200 group-hover/nav:opacity-100 group-focus-within/nav:opacity-100">{item.label}</span>
    </Link>
  );
}

function isActive(pathname: string, activeHash: string, item: NavItem) {
  const [cleanHref, hash] = item.href.split("#");
  if (hash) return pathname === cleanHref && activeHash === hash;
  if (item.exact) {
    return pathname === cleanHref && (cleanHref !== "/companion/settings" || !activeHash);
  }
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function useActiveHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash.replace(/^#/, ""));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return hash;
}
