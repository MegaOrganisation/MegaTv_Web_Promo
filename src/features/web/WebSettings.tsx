"use client";

import { clsx } from "clsx";
import { Cloud, LayoutGrid, Languages, Puzzle, Layers3, Server, Tv, Volume2, ExternalLink, PanelLeft, PanelTop } from "lucide-react";
import type { ReactNode } from "react";

import { LottieToggle } from "@/features/web/LottieToggle";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import { useWebPrefs, type WebLayout, type WebNavLayout } from "@/lib/web/prefs";

export type SettingsAddon = { id: string; name: string; logo: string | null; type: string; enabled: boolean };
export type SettingsCatalog = { id: string; title: string; sourceLabel: string };
export type SettingsIptv = { id: string; name: string; type: string; maskedUrl: string; enabled: boolean };
export type SettingsHomeServer = { id: string; name: string; maskedUrl: string };

export type SettingsIntegrations = {
  addons: SettingsAddon[];
  catalogs: SettingsCatalog[];
  iptv: SettingsIptv[];
  homeServers: SettingsHomeServer[];
};

const COMPANION_ROUTES = {
  addons: "/companion/manage/addons",
  iptv: "/companion/manage/iptv",
  catalogs: "/companion/manage/catalogs"
} as const;

function Row({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return (
    <div className="mega-settings-row border-b border-[var(--mega-border)] last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] text-[var(--mega-accent-bright)]">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--mega-text)]">{title}</p>
          {description ? <p className="text-xs text-[var(--mega-text-faint)]">{description}</p> : null}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function IntegrationSection({
  icon,
  title,
  count,
  manageHref,
  emptyLabel,
  children
}: {
  icon: ReactNode;
  title: string;
  count: number;
  manageHref: string;
  emptyLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="mega-glass rounded-[24px] p-4 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--mega-card-bg)] text-[var(--mega-text)]">{icon}</span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-[var(--mega-text)]">{title}</h2>
            <p className="text-xs text-[var(--mega-text-faint)]">
              {count > 0 ? `${count} élément${count > 1 ? "s" : ""} · lecture seule` : "Lecture seule"}
            </p>
          </div>
        </div>
        <a
          href={manageHref}
          className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--mega-text-muted)] transition hover:border-[var(--mega-border-strong)] hover:text-[var(--mega-text)]"
        >
          Gérer dans MegaCompagnon
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      {count === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--mega-border)] px-4 py-6 text-center text-xs text-[var(--mega-text-faint)]">{emptyLabel}</p>
      ) : (
        <ul className="space-y-1.5">{children}</ul>
      )}
    </section>
  );
}

function IntegrationItem({
  logo,
  fallbackIcon,
  title,
  subtitle,
  trailing
}: {
  logo?: string | null;
  fallbackIcon: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-card-bg)] px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--mega-input-bg)] text-[var(--mega-text-muted)]">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote addon/logo URLs; next/image domains not configured
          <img src={logo} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          fallbackIcon
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--mega-text)]">{title}</p>
        {subtitle ? <p className="truncate text-xs text-[var(--mega-text-faint)]">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </li>
  );
}

function StatusPill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        on ? "bg-[color-mix(in_srgb,var(--mega-green)_20%,transparent)] text-[var(--mega-green)]" : "bg-[var(--mega-input-bg)] text-[var(--mega-text-faint)]"
      )}
    >
      {on ? onLabel : offLabel}
    </span>
  );
}

export function WebSettings({ accountEmail, integrations }: { accountEmail: string | null; integrations: SettingsIntegrations | null }) {
  const { activeProfileId, activeProfile, withProfile } = useWebProfile();
  const { prefs, update } = useWebPrefs(activeProfileId);

  const layouts: { value: WebLayout; label: string }[] = [
    { value: "poster", label: "Affiche" },
    { value: "landscape", label: "Paysage" }
  ];

  const navLayouts: { value: WebNavLayout; label: string; icon: ReactNode }[] = [
    { value: "vertical", label: "Verticale", icon: <PanelLeft className="h-4 w-4" /> },
    { value: "horizontal", label: "Horizontale", icon: <PanelTop className="h-4 w-4" /> }
  ];

  const data = integrations ?? { addons: [], catalogs: [], iptv: [], homeServers: [] };

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
        <Row
          icon={<PanelLeft className="h-4 w-4" />}
          title="Barre de navigation"
          description="Verticale (rail à gauche) ou horizontale en haut à gauche, comme sur l'app TV."
        >
          <div className="flex rounded-full border border-[var(--mega-border)] bg-[var(--mega-input-bg)] p-1">
            {navLayouts.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ navLayout: option.value })}
                className={clsx(
                  "focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  prefs.navLayout === option.value ? "bg-[var(--mega-text)] text-[var(--mega-background-deep)]" : "text-[var(--mega-text-muted)]"
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </Row>
      </section>

      <section className="mega-glass rounded-[24px] p-4 sm:p-6">
        <h2 className="mb-1 px-1 text-sm font-bold uppercase tracking-wide text-[var(--mega-text-faint)]">Bandes-annonces</h2>
        <Row icon={<Volume2 className="h-4 w-4" />} title="Lecture auto au survol" description="Pré-charge et joue la bande-annonce du hero au survol stable.">
          <LottieToggle checked={prefs.trailerAutoplay} onChange={(v) => update({ trailerAutoplay: v })} label="Lecture auto des bandes-annonces" />
        </Row>
        <Row icon={<Volume2 className="h-4 w-4" />} title="Son des bandes-annonces" description="Active le son par défaut lors de la lecture du hero.">
          <LottieToggle checked={prefs.trailerSound} onChange={(v) => update({ trailerSound: v })} label="Son des bandes-annonces" />
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

      <div className="space-y-2 px-1">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--mega-text-faint)]">Intégrations</h2>
        <p className="text-xs text-[var(--mega-text-faint)]">
          Configurées pour ce profil. La modification (ajout, suppression, activation) se fait dans MegaCompagnon.
        </p>
      </div>

      <IntegrationSection
        icon={<Puzzle className="h-4 w-4" />}
        title="Addons Stremio"
        count={data.addons.length}
        manageHref={withProfile(COMPANION_ROUTES.addons)}
        emptyLabel="Aucun addon installé pour ce profil."
      >
        {data.addons.map((addon) => (
          <IntegrationItem
            key={addon.id}
            logo={addon.logo}
            fallbackIcon={<Puzzle className="h-4 w-4" />}
            title={addon.name}
            subtitle={addon.type}
            trailing={<StatusPill on={addon.enabled} onLabel="Actif" offLabel="Inactif" />}
          />
        ))}
      </IntegrationSection>

      <IntegrationSection
        icon={<Tv className="h-4 w-4" />}
        title="Listes IPTV"
        count={data.iptv.length}
        manageHref={withProfile(COMPANION_ROUTES.iptv)}
        emptyLabel="Aucune playlist IPTV configurée pour ce profil."
      >
        {data.iptv.map((list) => (
          <IntegrationItem
            key={list.id}
            fallbackIcon={<Tv className="h-4 w-4" />}
            title={list.name}
            subtitle={`${list.type} · ${list.maskedUrl}`}
            trailing={<StatusPill on={list.enabled} onLabel="Activée" offLabel="Désactivée" />}
          />
        ))}
      </IntegrationSection>

      <IntegrationSection
        icon={<Layers3 className="h-4 w-4" />}
        title="Catalogues"
        count={data.catalogs.length}
        manageHref={withProfile(COMPANION_ROUTES.catalogs)}
        emptyLabel="Aucun catalogue configuré pour ce profil."
      >
        {data.catalogs.map((catalog) => (
          <IntegrationItem key={catalog.id} fallbackIcon={<Layers3 className="h-4 w-4" />} title={catalog.title} subtitle={catalog.sourceLabel} />
        ))}
      </IntegrationSection>

      <IntegrationSection
        icon={<Server className="h-4 w-4" />}
        title="Serveurs Maison"
        count={data.homeServers.length}
        manageHref={withProfile(COMPANION_ROUTES.catalogs)}
        emptyLabel="Aucun serveur maison configuré pour ce profil."
      >
        {data.homeServers.map((server) => (
          <IntegrationItem key={server.id} fallbackIcon={<Server className="h-4 w-4" />} title={server.name} subtitle={server.maskedUrl} />
        ))}
      </IntegrationSection>

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
