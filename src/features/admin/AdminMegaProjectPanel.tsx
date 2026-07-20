"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowUpRight, Kanban, Loader2 } from "lucide-react";
import { motion } from "motion/react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaLink } from "@/components/ui/MegaButton";
import type { MegaProjectTasksPayload } from "@/lib/megaproject/tasks";

const statusTone: Record<string, string> = {
  todo: "bg-white/10 text-[var(--mega-text-muted)]",
  doing: "bg-[rgba(63,154,230,0.15)] text-[var(--brand-blue)]",
  review: "bg-[rgba(242,180,60,0.15)] text-[var(--brand-gold)]",
  blocked: "bg-[rgba(238,106,84,0.15)] text-[var(--brand-coral)]"
};

export function AdminMegaProjectPanel() {
  const [data, setData] = useState<MegaProjectTasksPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/companion/megaproject/tasks");
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as MegaProjectTasksPayload;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ configured: false, embedUrl: null, tasks: [], openCount: 0, error: "Chargement impossible" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GlassCard as="section" className="overflow-hidden">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mega-metric-icon-wrap">
            <Kanban className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--mega-text)]">MegaProject</h2>
            <p className="mt-1 text-sm text-[var(--mega-text-muted)]">Tâches ouvertes et lien Kanban IA.</p>
          </div>
        </div>
        <MegaLink href="/companion/admin/megaproject" variant="ghost" className="inline-flex items-center gap-2">
          Ouvrir le board
          <ArrowUpRight className="h-4 w-4" />
        </MegaLink>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--mega-text-faint)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Synchronisation…
        </div>
      ) : null}

      {!loading && data?.error && !data.configured ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] p-4 text-sm text-[var(--mega-text-muted)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
          <div>
            <p>Table `tasks` indisponible ou RLS restrictif.</p>
            <p className="mt-1 text-xs text-[var(--mega-text-faint)]">{data.error}</p>
            {data.embedUrl ? (
              <a href={data.embedUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-blue)]">
                Ouvrir MegaProject externe
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {!loading && data && data.tasks.length > 0 ? (
        <ul className="space-y-2">
          {data.tasks.map((task, index) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <Link
                href="/companion/admin/megaproject"
                className="mega-hover-lift mega-press flex items-center justify-between gap-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-4 py-3 transition"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--mega-text)]">{task.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--mega-text-faint)]">{task.updated_at ? new Date(task.updated_at).toLocaleDateString("fr-FR") : "—"}</p>
                </div>
                <span className={clsxStatus(task.status)}>{task.status || "todo"}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      ) : null}

      {!loading && data?.configured && data.tasks.length === 0 ? (
        <p className="text-sm text-[var(--mega-text-faint)]">Aucune tâche ouverte — tout est à jour.</p>
      ) : null}
    </GlassCard>
  );
}

function clsxStatus(status: string | null) {
  const base = "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide";
  return `${base} ${statusTone[status || "todo"] || statusTone.todo}`;
}
