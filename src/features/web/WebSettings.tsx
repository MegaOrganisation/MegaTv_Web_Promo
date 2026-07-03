"use client";

import { clsx } from "clsx";
import { Cloud, LayoutGrid, Languages, Volume2 } from "lucide-react";
import type { ReactNode } from "react";

import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs, type WebLayout } from "@/lib/web/prefs";

function Row({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--mega-border)] px-1 py-4 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--mega-card-bg)] text-[var(--mega-text)]">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--mega-text)]">{title}</p>
          {description ? <p className="text-xs text-[var(--mega-text-faint)]">{description}</p> : null}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        "focus-ring relative h-7 w-12 rounded-full border transition",
        checked ? "border-transparent bg-[var(--mega-green)]" : "border-[var(--mega-border-strong)] bg-[var(--mega-input-bg)]"
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[1.4rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function WebSettings({ accountEmail }: { accountEmail: string | null }) {
  const { activeProfileId, activeProfile } = useWebProfile();
  const { prefs, update } = useWebPrefs(activeProfileId);

  const layouts: { value: WebLayout; label: string }[] = [
    { value: "poster", label: "Affiche" },
    { value: "landscape", label: "Paysage" }
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="mega-glass rounded-[24px] p-4 sm:p-6">
        <h2 className="mb-1 px-1 text-sm font-bold uppercase tracking-wide text-[var(--mega-text-faint)]">Affichage</h2>
        <Row icon={<LayoutGrid className="h-4 w-4" />} title="Disposition des rails" description="Appliquée à l'accueil (affiche 2:3 ou paysage 16:9).">
          <div className="flex rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] p-1">
            {layouts.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ layout: option.value })}
                className={clsx(
                  "focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  prefs.layout === option.value ? "bg-[var(--mega-text)] text-[var(--mega-background-deep)]" : "text-[var(--mega-text-muted)]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Row>
      </section>

      <section className="mega-glass rounded-[24px] p-4 sm:p-6">
        <h2 className="mb-1 px-1 text-sm font-bold uppercase tracking-wide text-[var(--mega-text-faint)]">Bandes-annonces</h2>
        <Row icon={<Volume2 className="h-4 w-4" />} title="Lecture auto au survol" description="Pré-charge et joue la bande-annonce du hero au survol stable.">
          <Toggle checked={prefs.trailerAutoplay} onChange={(v) => update({ trailerAutoplay: v })} label="Lecture auto des bandes-annonces" />
        </Row>
        <Row icon={<Volume2 className="h-4 w-4" />} title="Son des bandes-annonces" description="Active le son par défaut lors de la lecture du hero.">
          <Toggle checked={prefs.trailerSound} onChange={(v) => update({ trailerSound: v })} label="Son des bandes-annonces" />
        </Row>
      </section>

      <section className="mega-glass rounded-[24px] p-4 sm:p-6">
        <h2 className="mb-1 px-1 text-sm font-bold uppercase tracking-wide text-[var(--mega-text-faint)]">Langue</h2>
        <Row icon={<Languages className="h-4 w-4" />} title="Langue de l'interface" description="Préférence enregistrée (i18n complète à venir).">
          <select
            value={prefs.language}
            onChange={(event) => update({ language: event.target.value })}
            className="focus-ring rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--mega-text)] outline-none"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </Row>
      </section>

      <section className="mega-glass rounded-[24px] p-4 sm:p-6">
        <h2 className="mb-1 px-1 text-sm font-bold uppercase tracking-wide text-[var(--mega-text-faint)]">Compte MegaCloud</h2>
        <Row icon={<Cloud className="h-4 w-4" />} title={accountEmail || "Compte connecté"} description={`Profil actif : ${activeProfile?.name || "—"}`}>
          <span className="rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--mega-text-faint)]">
            Synchronisé
          </span>
        </Row>
      </section>
    </div>
  );
}
