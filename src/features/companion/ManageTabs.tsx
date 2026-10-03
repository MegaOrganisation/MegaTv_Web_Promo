"use client";

import { MegaPillTabs } from "@/features/companion/ui/MegaPillTabs";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { Layers3, MonitorSmartphone, Puzzle, SlidersHorizontal, Tv, UsersRound } from "lucide-react";

const tabs = [
  { href: "/companion/manage/iptv", label: "IPTV", icon: Tv },
  { href: "/companion/manage/addons", label: "Addons", icon: Puzzle },
  { href: "/companion/manage/catalogs", label: "Catalogues", shortLabel: "Catal.", icon: Layers3 },
  { href: "/companion/manage/profiles", label: "Profils", icon: UsersRound },
  { href: "/companion/manage/devices", label: "Appareils", shortLabel: "App.", icon: MonitorSmartphone },
  { href: "/companion/manage/settings", label: "Paramètres", shortLabel: "Param.", icon: SlidersHorizontal }
];

export function ManageTabs() {
  const { withProfile } = useCompanionProfile();
  return <MegaPillTabs tabs={tabs} withHref={withProfile} />;
}
