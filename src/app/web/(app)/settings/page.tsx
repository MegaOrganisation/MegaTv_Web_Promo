import { WebSettings, type SettingsIntegrations } from "@/features/web/WebSettings";
import { getAddonsSlice, getCatalogsSlice } from "@/lib/companion/sync-queries";
import type { CatalogSourceType } from "@/lib/companion/sync-types";
import { getCurrentUser } from "@/lib/auth/require-user";
import { getIptvPlaylistsForProfile } from "@/lib/iptv/queries";
import { detectPlaylistType, maskPlaylistUrl } from "@/lib/iptv/types";

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<CatalogSourceType, string> = {
  PREINSTALLED: "Préinstallé",
  TRAKT: "Trakt",
  MDBLIST: "MDBList",
  ADDON: "Addon",
  HOME_SERVER: "Serveur maison"
};

async function loadIntegrations(profileId: string): Promise<SettingsIntegrations> {
  // Free Tier: profile-scoped slice reads only (v_account_sync_*) — no monolithic blob re-download.
  const [addonsSlice, catalogsSlice, iptv] = await Promise.all([
    getAddonsSlice(profileId),
    getCatalogsSlice(profileId),
    getIptvPlaylistsForProfile(profileId)
  ]);

  const hidden = new Set(addonsSlice.hiddenBuiltIn);
  const addons = addonsSlice.addons
    .filter((addon) => addon.isInstalled && !hidden.has(addon.id))
    .map((addon) => ({
      id: addon.id,
      name: addon.name || "Addon",
      logo: addon.logo || null,
      type: addon.runtimeKind === "STREMIO" ? "Stremio" : addon.type.charAt(0) + addon.type.slice(1).toLowerCase(),
      enabled: addon.isEnabled
    }));

  const catalogs = catalogsSlice.catalogs.map((catalog) => ({
    id: catalog.id,
    title: catalog.title || "Catalogue",
    sourceLabel: catalog.addonName || SOURCE_LABELS[catalog.sourceType] || catalog.sourceType
  }));

  const homeServers = catalogsSlice.catalogs
    .filter((catalog) => catalog.sourceType === "HOME_SERVER")
    .map((catalog) => ({
      id: catalog.id,
      name: catalog.title || "Serveur maison",
      maskedUrl: catalog.sourceUrl ? maskPlaylistUrl(catalog.sourceUrl) : "—"
    }));

  const iptvLists = iptv.playlists.map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    type: detectPlaylistType(playlist.m3uUrl),
    maskedUrl: maskPlaylistUrl(playlist.m3uUrl),
    enabled: playlist.enabled !== false
  }));

  return { addons, catalogs, iptv: iptvLists, homeServers };
}

export default async function WebSettingsPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const profileId = params.profile?.trim();
  const integrations = profileId ? await loadIntegrations(profileId) : null;

  return (
    <div className="space-y-6">
      <h1 className="px-1 text-2xl font-bold text-[var(--mega-text)]">Réglages</h1>
      <WebSettings accountEmail={user?.email ?? null} integrations={integrations} />
    </div>
  );
}
