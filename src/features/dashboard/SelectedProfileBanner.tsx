"use client";

import { clsx } from "clsx";
import { motion } from "motion/react";

import { GlassCard } from "@/components/ui/GlassCard";
import { ProfileAvatar } from "@/features/dashboard/ProfileAvatar";
import type { DashboardSummary, ProfileRow } from "@/lib/supabase/types";
import { Infinity as InfinityIcon, LockKeyhole, UsersRound } from "lucide-react";

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
      <GlassCard className="mega-bento-hero mb-6 flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[var(--mega-cp-border-strong)] bg-[linear-gradient(135deg,#3f9ae6,#d8497f)] text-white shadow-lg">
            <UsersRound className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--mega-text-faint)]">Vue compte complet</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--mega-text)]">Tous les profils</h2>
            <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Stats agrégées sur tout le compte MegaTv Cloud.</p>
          </div>
        </div>
        <Badge>
          <InfinityIcon className="h-4 w-4" />
          {summary.profile_count} profils inclus
        </Badge>
      </GlassCard>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <GlassCard className="mega-bento-hero mb-6 flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center gap-4">
          <ProfileAvatar profile={activeProfile} avatarUrl={avatarUrl} size="lg" preferPreset={Boolean((activeProfile.avatar_id || 0) > 0)} />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--mega-text-faint)]">Profil sélectionné</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--mega-text)]">{activeProfile.name || "Profil MegaTv"}</h2>
            <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Les métriques affichées appartiennent uniquement à ce profil.</p>
          </div>
        </div>
        <div className="relative flex flex-wrap gap-2">
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
    </motion.div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mega-cp-border)] bg-[var(--mega-card-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--mega-text-muted)] backdrop-blur-sm">
      {children}
    </span>
  );
}
