"use client";

import { DashboardEditToggle } from "@/features/dashboard/DashboardLayoutShell";

type Props = {
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
};

export function DashboardEditHeaderButton({ editMode, onEditModeChange }: Props) {
  return <DashboardEditToggle active={editMode} onToggle={() => onEditModeChange(!editMode)} />;
}
