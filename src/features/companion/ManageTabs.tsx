"use client";

import { MegaPillTabs } from "@/features/companion/ui/MegaPillTabs";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { Layers3, Puzzle, Tv } from "lucide-react";

const tabs = [
  { href: "/companion/manage/iptv", label: "IPTV", icon: Tv },
  { href: "/companion/manage/addons", label: "Addons", icon: Puzzle },
  { href: "/companion/manage/catalogs", label: "Catalogues", icon: Layers3 }
];

export function ManageTabs() {
  const { withProfile } = useCompanionProfile();
  return <MegaPillTabs tabs={tabs} withHref={withProfile} />;
}
