"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Layers3, Puzzle, Tv } from "lucide-react";

import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

const tabs = [
  { href: "/companion/manage/iptv", label: "IPTV", icon: Tv },
  { href: "/companion/manage/addons", label: "Addons", icon: Puzzle },
  { href: "/companion/manage/catalogs", label: "Catalogues", icon: Layers3 }
];

export function ManageTabs() {
  const pathname = usePathname();
  const { withProfile } = useCompanionProfile();

  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={withProfile(href)}
            prefetch
            className={clsx(
              "focus-ring flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
              active ? "border-white/30 bg-white/14 text-white" : "border-white/10 bg-white/[0.045] text-white/55 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
