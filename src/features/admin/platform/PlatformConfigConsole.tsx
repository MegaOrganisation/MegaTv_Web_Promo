"use client";

import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaButton } from "@/components/ui/MegaButton";
import type { PlatformConfigRevision } from "@/lib/companion/sync-types";

const scopes = ["defaults", "addons", "iptv", "catalogs"] as const;

export function PlatformConfigConsole() {
  const [scope, setScope] = useState<(typeof scopes)[number]>("defaults");
  const [payloadText, setPayloadText] = useState('{\n  "note": "Defaults publiés depuis MegaCompagnon"\n}');
  const [mandatory, setMandatory] = useState(false);
  const [revisions, setRevisions] = useState<PlatformConfigRevision[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/admin/platform-config?scope=${scope}`);
    const json = await res.json();
    setRevisions(json.revisions || []);
  };

  useEffect(() => {
    load();
  }, [scope]);

  const publish = async () => {
    setStatus(null);
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadText) as Record<string, unknown>;
    } catch {
      setStatus("JSON invalide");
      return;
    }
    const res = await fetch("/api/admin/platform-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, payload, mandatoryOnBoot: mandatory })
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error || "Échec publication");
      return;
    }
    setStatus(`Révision ${json.revision?.revision} publiée.`);
    await load();
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3">
          <Rocket className="h-5 w-5 text-white/70" />
          <div>
            <h2 className="text-xl font-bold text-white">Config plateforme</h2>
            <p className="text-sm text-white/45">Révisions versionnées — Android doit lire config_revision au boot (follow-up).</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {scopes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold ${
                scope === s ? "border-white/30 bg-white/14 text-white" : "border-white/10 text-white/55"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} />
          mandatory_on_boot
        </label>
        <textarea
          className="focus-ring mt-4 min-h-48 w-full rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs text-white"
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
        />
        <MegaButton className="mt-4" onClick={publish}>
          Publier révision
        </MegaButton>
        {status ? <p className="mt-3 text-sm text-white/60">{status}</p> : null}
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold text-white">Historique ({scope})</h3>
        <div className="mt-4 space-y-2">
          {revisions.length === 0 ? (
            <p className="text-sm text-white/45">Aucune révision.</p>
          ) : (
            revisions.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/60">
                <span className="font-semibold text-white">r{rev.revision}</span> · {new Date(rev.published_at).toLocaleString("fr-FR")}
                {rev.mandatory_on_boot ? " · boot obligatoire" : ""}
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
