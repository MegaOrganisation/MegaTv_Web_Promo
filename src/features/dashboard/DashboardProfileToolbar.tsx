"use client";

import { DashboardEditToggle } from "@/features/dashboard/DashboardLayoutShell";
import { ProfileSwitcher } from "@/features/dashboard/ProfileSwitcher";
import type { ProfileRow } from "@/lib/supabase/types";

type Props = {
  profiles: ProfileRow[];
  activeProfileId: string | null;
  profileAvatarUrlsById: Record<string, string>;
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
};

export function DashboardProfileToolbar({ profiles, activeProfileId, profileAvatarUrlsById, editMode, onEditModeChange }: Props) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <ProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} profileAvatarUrlsById={profileAvatarUrlsById} />
      </div>
      <DashboardEditToggle active={editMode} onToggle={() => onEditModeChange(!editMode)} />
    </div>
  );
}
