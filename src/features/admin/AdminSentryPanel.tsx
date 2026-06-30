import { AlertTriangle, Bug, ExternalLink } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import type { SentrySummary } from "@/lib/sentry-admin";

export function AdminSentryPanel({ summary }: { summary: SentrySummary }) {
  return (
    <GlassCard as="section">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/45">Sentry</div>
          <h2 className="text-2xl font-bold text-white">Monitoring erreurs</h2>
          <p className="mt-2 text-sm text-white/45">Résumé nettoyé côté serveur, sans token ni payload brut.</p>
        </div>
        {summary.configured ? <Bug className="h-6 w-6 text-white/70" /> : <AlertTriangle className="h-6 w-6 text-yellow-200" />}
      </div>

      {!summary.configured ? (
        <div className="rounded-[22px] border border-yellow-200/20 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50/80">
          Variables Sentry serveur absentes. Configurez SENTRY_AUTH_TOKEN, SENTRY_ORG et les projets pour activer le panneau.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <p className="text-sm text-white/45">Issues non résolues remontées</p>
            <p className="mt-2 text-4xl font-black text-white">{summary.unresolvedIssues}</p>
          </div>
          {summary.topIssues.length === 0 ? <p className="text-sm text-white/45">Aucune issue Sentry dans la fenêtre actuelle.</p> : null}
          {summary.topIssues.map((issue) => (
            <a
              key={issue.id}
              href={issue.permalink || "#"}
              target="_blank"
              rel="noreferrer"
              className="focus-ring flex items-start justify-between gap-4 rounded-[20px] border border-white/8 bg-white/[0.035] p-3 transition hover:bg-white/[0.06]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{issue.title}</p>
                <p className="mt-1 truncate text-xs text-white/38">{issue.project} · {issue.level || "level"} · {issue.count || "0"} events</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-white/38" />
            </a>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
