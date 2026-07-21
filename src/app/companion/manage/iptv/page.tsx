import { GlassCard } from "@/components/ui/GlassCard";
import { IptvChannelsManager } from "@/features/iptv/IptvChannelsManager";
import { IptvPlaylistEditor } from "@/features/iptv/IptvPlaylistEditor";
import { getIptvPlaylistsForProfile } from "@/lib/iptv/queries";

export const dynamic = "force-dynamic";

export default async function ManageIptvPage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const params = await searchParams;
  const profileId = params.profile?.trim();
  if (!profileId) {
    return (
      <GlassCard className="p-4 sm:p-5">
        <p className="text-sm text-white/45">Sélectionnez un profil pour gérer les playlists IPTV.</p>
      </GlassCard>
    );
  }

  const { playlists, favoriteChannels, hiddenCategories, hiddenChannels, error, scope } = await getIptvPlaylistsForProfile(profileId);

  return (
    <div className="space-y-5">
      {scope === "account" ? (
        <GlassCard className="border-blue-300/20 bg-blue-300/8 p-4 sm:p-5">
          <p className="text-sm text-blue-100">
            Playlist chargée au niveau <strong>compte</strong> (champ legacy `iptvM3uUrl` ou autre profil). Elle est affichée ici pour édition sur ce profil.
          </p>
        </GlassCard>
      ) : null}
      {error ? (
        <GlassCard className="border-yellow-300/20 bg-yellow-300/8 p-4 sm:p-5">
          <p className="text-sm text-yellow-100">{error}</p>
        </GlassCard>
      ) : null}
      <IptvPlaylistEditor profileId={profileId} initialPlaylists={playlists} />
      <IptvChannelsManager
        profileId={profileId}
        initialFavorites={favoriteChannels}
        initialHiddenCategories={hiddenCategories}
        initialHiddenChannels={hiddenChannels}
      />
    </div>
  );
}
