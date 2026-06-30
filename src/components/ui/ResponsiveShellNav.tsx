"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { BarChart3, Home, MonitorCog, MonitorSmartphone, Settings, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  exact?: boolean;
};

const baseItems: NavItem[] = [
  { href: "/companion", label: "Dashboard", shortLabel: "Home", icon: Home, exact: true },
  { href: "/companion/settings#profiles", label: "Profils", shortLabel: "Profils", icon: UserRound },
  { href: "/companion/settings#devices", label: "Appareils", shortLabel: "App.", icon: MonitorSmartphone },
  { href: "/companion/settings", label: "Réglages", shortLabel: "Régl.", icon: Settings, exact: true }
];

const adminItem: NavItem = { href: "/companion/admin", label: "Admin", shortLabel: "Admin", icon: ShieldCheck, exact: true };

export function DesktopCompanionNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const activeHash = useActiveHash();
  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  return (
    <aside
      aria-label="Navigation MegaCompagnon"
      className="group fixed left-4 top-4 z-40 hidden h-[calc(100vh-32px)] w-20 flex-col justify-between overflow-hidden rounded-[30px] border border-white/10 bg-black/38 p-3 backdrop-blur-2xl transition-[width,background-color] duration-300 ease-out hover:w-72 focus-within:w-72 hover:bg-black/48 lg:flex"
    >
      <div className="min-w-0">
        <Link href="/" className="focus-ring mb-8 flex min-w-0 items-center gap-3 rounded-2xl p-2">
          <Image src="/assets/mark.png" alt="MegaTv" width={42} height={42} className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="min-w-0 whitespace-nowrap opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            <p className="text-sm text-white/45">MegaTv</p>
            <p className="truncate text-lg font-bold text-white">MegaCompagnon</p>
          </div>
        </Link>
        <nav className="space-y-2">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, activeHash, item)} variant="desktop" />
          ))}
        </nav>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] p-3">
        <MonitorCog className="mx-auto h-5 w-5 shrink-0 text-white/75 transition group-hover:mx-0 group-focus-within:mx-0" />
        <div className="mt-3 min-w-56 opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <p className="text-sm font-semibold text-white">Vue officielle MegaTv</p>
          <p className="mt-1 text-xs leading-5 text-white/45">Données isolées par compte Supabase et profil actif.</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileCompanionChrome({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const activeHash = useActiveHash();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#06070a]/82 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
          <Link href="/" className="focus-ring flex min-w-0 items-center gap-2 rounded-2xl">
            <Image src="/assets/mark.png" alt="MegaTv" width={34} height={34} className="h-9 w-9 shrink-0 rounded-lg" />
            <span className="min-w-0 truncate text-sm font-bold sm:text-base">MegaCompagnon</span>
          </Link>
          {isAdmin ? (
            <Link href="/companion/admin" className="focus-ring inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-3 text-xs font-semibold text-white">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          ) : (
            <Link href="/companion" className="focus-ring inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-3 text-xs font-semibold text-white">
              <BarChart3 className="h-4 w-4" />
              Stats
            </Link>
          )}
        </div>
      </header>

      <nav className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 right-2 z-50 mx-auto grid w-[calc(100%-1rem)] max-w-md grid-cols-4 gap-1 rounded-[24px] border border-white/10 bg-black/72 p-1.5 backdrop-blur-2xl lg:hidden">
        {baseItems.map((item) => (
          <NavLink key={`${item.href}-mobile`} item={item} active={isActive(pathname, activeHash, item)} variant="mobile" />
        ))}
      </nav>
    </>
  );
}

function NavLink({ item, active, variant }: { item: NavItem; active: boolean; variant: "desktop" | "mobile" }) {
  const Icon = item.icon;

  if (variant === "mobile") {
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={clsx(
          "focus-ring flex min-w-0 flex-col items-center gap-1 rounded-[18px] px-1 py-2 text-[10px] font-semibold transition sm:text-[11px]",
          active ? "bg-white/12 text-white" : "text-white/52 hover:bg-white/[0.06] hover:text-white"
        )}
      >
        <Icon className={clsx("h-4 w-4 shrink-0", active ? "text-white" : "text-white/58")} fill={active ? "currentColor" : "none"} strokeWidth={active ? 2.8 : 2} />
        <span className="block w-full truncate text-center leading-none">{item.shortLabel}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "focus-ring flex min-w-0 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
        active ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" : "text-white/58 hover:bg-white/[0.07] hover:text-white"
      )}
    >
      <Icon className={clsx("h-5 w-5 shrink-0", active ? "text-white" : "text-white/62")} fill={active ? "currentColor" : "none"} strokeWidth={active ? 2.8 : 2} />
      <span className="min-w-0 truncate whitespace-nowrap opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">{item.label}</span>
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
