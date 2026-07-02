"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Upload } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { MegaButton, MegaLink } from "@/components/ui/MegaButton";
import type { VersionManifest } from "@/lib/companion/sync-types";

type ReleaseState = {
  manifest: VersionManifest | null;
  manifestError: string | null;
  github: { tag?: string; url?: string; publishedAt?: string; apkAsset?: string | null } | null;
  serviceRoleConfigured: boolean;
};

const emptyManifest = (): VersionManifest => ({
  versionCode: 0,
  versionName: "",
  url: "",
  features: [""],
  fixes: [""],
  improvements: [""]
});

export function ReleasesConsole() {
  const [state, setState] = useState<ReleaseState | null>(null);
  const [form, setForm] = useState<VersionManifest>(emptyManifest());
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/releases");
    const json = await res.json();
    setState(json);
    if (json.manifest) setForm(json.manifest);
  };

  useEffect(() => {
    load();
  }, []);

  const updateList = (key: "features" | "fixes" | "improvements", index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? value : item))
    }));
  };

  const addListItem = (key: "features" | "fixes" | "improvements") => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const publish = async () => {
    setUploading(true);
    setStatus(null);
    try {
      const payload = {
        ...form,
        features: form.features.filter(Boolean),
        fixes: form.fixes.filter(Boolean),
        improvements: form.improvements.filter(Boolean)
      };
      const res = await fetch("/api/admin/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload échoué");
      setStatus("version.json publié sur Supabase Storage.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-bold text-white">Manifeste OTA live</h2>
        <p className="mt-1 text-sm text-white/45">Lecture publique Supabase + statut release GitHub MegaTv_Web_Auth.</p>
        {state?.manifestError ? <p className="mt-3 text-sm text-red-200/80">{state.manifestError}</p> : null}
        {state?.manifest ? (
          <div className="mt-4 grid gap-2 text-sm text-white/60 sm:grid-cols-2">
            <p>
              versionCode : <span className="font-semibold text-white">{state.manifest.versionCode}</span>
            </p>
            <p>
              versionName : <span className="font-semibold text-white">{state.manifest.versionName}</span>
            </p>
          </div>
        ) : null}
        {state?.github ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
            <p>
              Dernière release GitHub : <span className="text-white">{state.github.tag || "—"}</span>
            </p>
            {state.github.url ? (
              <MegaLink href={state.github.url} variant="ghost" className="mt-3 min-h-9 px-3 text-xs">
                <ExternalLink className="h-4 w-4" />
                Ouvrir la release
              </MegaLink>
            ) : null}
          </div>
        ) : null}
        {!state?.serviceRoleConfigured ? (
          <p className="mt-4 text-sm text-yellow-100/80">
            SUPABASE_SERVICE_ROLE_KEY absent — lecture seule. Ajoutez la variable Vercel pour publier.
          </p>
        ) : null}
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-bold text-white">Éditer version.json</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-white/45">
            versionCode
            <input
              type="number"
              className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={form.versionCode}
              onChange={(e) => setForm((p) => ({ ...p, versionCode: Number(e.target.value) }))}
            />
          </label>
          <label className="text-xs text-white/45 sm:col-span-2">
            versionName
            <input
              className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={form.versionName}
              onChange={(e) => setForm((p) => ({ ...p, versionName: e.target.value }))}
            />
          </label>
          <label className="text-xs text-white/45 sm:col-span-3">
            url APK (MegaTv_Web_Auth public)
            <input
              className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            />
          </label>
        </div>

        {(["features", "fixes", "improvements"] as const).map((key) => (
          <div key={key} className="mt-5">
            <p className="text-sm font-semibold capitalize text-white">{key} (FR)</p>
            <div className="mt-2 space-y-2">
              {form[key].map((line, index) => (
                <input
                  key={`${key}-${index}`}
                  className="focus-ring w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  value={line}
                  onChange={(e) => updateList(key, index, e.target.value)}
                />
              ))}
              <MegaButton variant="ghost" className="min-h-9 px-3 text-xs" onClick={() => addListItem(key)}>
                + ligne
              </MegaButton>
            </div>
          </div>
        ))}

        <div className="mt-6 flex flex-wrap gap-2">
          <MegaButton disabled={uploading || !state?.serviceRoleConfigured} onClick={publish}>
            <Upload className="h-4 w-4" />
            Publier sur Supabase
          </MegaButton>
        </div>
        {status ? <p className="mt-4 text-sm text-white/60">{status}</p> : null}
      </GlassCard>
    </div>
  );
}
