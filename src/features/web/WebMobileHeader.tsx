"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";

import { MegaTvIcon } from "@/features/web/icons/MegaTvIcon";
import { useWebProfile } from "@/features/web/WebProfileProvider";

/** Mobile top bar — parité mockup IPTV premium (menu · logo · actions). */
export function WebMobileHeader() {
  const { withProfile } = useWebProfile();

  return (
    <header className="mega-mobile-header pointer-events-none fixed inset-x-0 top-0 z-[80] lg:hidden">
      <div className="mega-mobile-header-scrim" aria-hidden />
      <div className="relative flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.65rem,env(safe-area-inset-top))]">
        <Link
          href={withProfile("/web?switch=1")}
          prefetch
          aria-label="Changer de profil"
          className="focus-ring pointer-events-auto mega-pro-icon-btn grid h-11 w-11 place-items-center rounded-full"
        >
          <Menu className="h-5 w-5" />
        </Link>

        <Link href={withProfile("/web/home")} prefetch className="pointer-events-auto flex min-w-0 flex-1 items-center justify-center gap-2">
          <Image src="/assets/triangle-icon-180.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0 drop-shadow-[0_2px_12px_rgba(38,169,193,0.45)]" />
          <span className="truncate text-base font-extrabold tracking-tight text-[var(--mega-text)]">MegaTv</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href={withProfile("/web/search")}
            prefetch
            aria-label="Recherche"
            className="focus-ring pointer-events-auto mega-pro-icon-btn grid h-11 w-11 place-items-center rounded-full"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href={withProfile("/web/settings")}
            prefetch
            aria-label="Réglages"
            className="focus-ring pointer-events-auto mega-pro-icon-btn grid h-11 w-11 place-items-center rounded-full"
          >
            <MegaTvIcon name="settings" className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
