import { Infinity as InfinityIcon, LockKeyhole, UsersRound } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { ProfileAvatar } from "@/features/dashboard/ProfileAvatar";
import type { DashboardSummary, ProfileRow } from "@/lib/supabase/types";

export function SelectedProfileBanner({
  activeProfile,
  avatarUrl,
  summary
}: {
  activeProfile?: ProfileRow | null;
  avatarUrl?: string | null;
  summary: DashboardSummary;
}) {
  if (!activeProfile) {
    return (
      <GlassCard className="mb-6 flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/15 bg-[linear-gradient(135deg,#3f9ae6,#d8497f)] text-white">
            <UsersRound className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/38">Vue compte complet</p>
            <h2 className="mt-1 text-2xl font-black text-white">Tous les profils</h2>
            <p className="mt-1 text-sm text-white/50">Stats agrégées sur tout le compte MegaTv Cloud.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-white/58">
          <InfinityIcon className="h-4 w-4" />
          {summary.profile_count} profils inclus
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="mb-6 flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <ProfileAvatar profile={activeProfile} avatarUrl={avatarUrl} size="lg" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/38">Profil sélectionné</p>
          <h2 className="mt-1 text-2xl font-black text-white">{activeProfile.name || "Profil MegaTv"}</h2>
          <p className="mt-1 text-sm text-white/50">Les métriques affichées appartiennent uniquement à ce profil.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeProfile.is_kids_profile ? <Badge>Enfant</Badge> : null}
        {activeProfile.is_locked ? (
          <Badge>
            <LockKeyhole className="h-3.5 w-3.5" />
            Verrouillé
          </Badge>
        ) : null}
        {!activeProfile.is_kids_profile && !activeProfile.is_locked ? <Badge>Profil adulte</Badge> : null}
      </div>
    </GlassCard>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-white/58">{children}</span>;
}
