"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaLink } from "@/components/ui/MegaButton";
import { ResponsiveShell } from "@/components/ui/ResponsiveShell";
import { CinemaHero } from "@/features/companion/ui/CinemaHero";
import { PageEventTracker } from "@/features/dashboard/PageEventTracker";
import type { MegaProjectTasksPayload } from "@/lib/megaproject/types";

export function AdminMegaProjectPage({ initial }: { initial: MegaProjectTasksPayload }) {
  const embed = initial.embedUrl;

  return (
    <ResponsiveShell
      title="MegaProject"
      subtitle="Kanban IA et alertes tâches."
      isAdmin
      showRail={false}
      hero={<CinemaHero title="MegaProject" subtitle={`${initial.openCount} tâche(s) ouverte(s) détectée(s) via Supabase.`} badge="Admin" />}
    >
      <PageEventTracker page="Companion Admin MegaProject" />

      <div className="mb-4 flex flex-wrap gap-2">
        <MegaLink href="/companion/admin" variant="ghost" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour admin
        </MegaLink>
        {embed ? (
          <a href={embed} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85">
            <ExternalLink className="h-4 w-4" />
            Nouvel onglet
          </a>
        ) : null}
      </div>

      {initial.error && !initial.configured ? (
        <GlassCard className="mb-4 border-amber-300/20 bg-amber-400/8">
          <p className="text-sm font-semibold text-amber-100">API tâches MegaProject</p>
          <p className="mt-1 text-xs text-amber-100/70">{initial.error}</p>
          <p className="mt-2 text-xs text-white/45">
            Le Kanban embarqué fonctionne via <code className="rounded bg-white/8 px-1">/megaproject/</code> ; configurez{" "}
            <code className="rounded bg-white/8 px-1">MEGAPROJECT_SUPABASE_*</code> pour les compteurs admin.
          </p>
        </GlassCard>
      ) : null}

      <GlassCard className="overflow-hidden !p-0">
        <iframe title="MegaProject Kanban" src={embed!} className="h-[min(78vh,920px)] w-full border-0 bg-[#0a0e12]" allow="clipboard-read; clipboard-write" />
      </GlassCard>
    </ResponsiveShell>
  );
}
