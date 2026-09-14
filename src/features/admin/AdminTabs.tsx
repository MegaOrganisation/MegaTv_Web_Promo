"use client";

import { Kanban, LayoutDashboard, UsersRound } from "lucide-react";

import { MegaPillTabs } from "@/features/companion/ui/MegaPillTabs";
import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";

const tabs = [
  { href: "/companion/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/companion/admin/accounts", label: "Utilisateurs", shortLabel: "Users", icon: UsersRound },
  { href: "/companion/admin/megaproject", label: "MegaProject", shortLabel: "Projet", icon: Kanban }
];

export function AdminTabs() {
  const { withProfile } = useCompanionProfile();
  return <MegaPillTabs tabs={tabs} withHref={withProfile} />;
}
