import { SupabaseClient } from "@supabase/supabase-js";

export type SocialIdentity = {
  userId: string;
  profileId: string | null;
  friendCode: string;
  displayName: string | null;
  bio: string | null;
  shareProfileId: string | null;
};

export type SocialPrivacyPrefs = {
  ghostMode: boolean;
  shareWatching: boolean;
  shareWatchlist: boolean;
};

export type SocialFriend = {
  friendshipId: string;
  friendUserId: string;
  status: "accepted" | "pending" | "declined" | "blocked" | string;
  friendCode: string;
  displayName: string;
  friendProfileId: string | null;
  shareProfileId: string | null;
  avatarId: number;
  avatarImageStoragePath: string | null;
  avatarImageVersion: number;
  updatedAt: string | null;
  nowPlayingTitle?: string | null;
  nowPlayingPoster?: string | null;
};

export type SocialGraph = {
  identity: SocialIdentity;
  privacy: SocialPrivacyPrefs;
  friends: SocialFriend[];
  incoming: SocialFriend[];
  outgoing: SocialFriend[];
  acceptedCount: number;
  atFriendLimit?: boolean;
};

export type FriendWatchProposal = {
  id: string;
  fromUserId: string;
  fromProfileId: string | null;
  toProfileId: string | null;
  fromDisplayName: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  createdAt: string;
  watchedAt: string | null;
  watched: boolean;
};

export type MatchDeckCard = {
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  overview: string;
  year: string;
  voteAverage?: number;
};

export type FriendMatchSession = {
  sessionId: string;
  friendUserId: string;
  friendDisplayName: string;
  status: "pending" | "active" | "matched" | "finished";
  matchedTitle?: string | null;
  matchedPoster?: string | null;
  matchedTmdbId?: number | null;
  matchedMediaType?: string | null;
  createdAt: string;
};

export async function fetchSocialGraph(
  supabase: SupabaseClient,
  profileId?: string | null,
  profileName?: string | null
): Promise<SocialGraph> {
  const params: Record<string, unknown> = {};
  if (profileId) params.p_profile_id = profileId;
  if (profileName) params.p_profile_name = profileName;

  try {
    const { data, error } = await supabase.rpc("list_my_social_graph", params);
    if (!error && data) {
      return normalizeSocialGraph(data, profileId);
    }
  } catch (_) {}

  // Auto-heal: Ensure identity then retry
  try {
    await supabase.rpc("ensure_profile_social_identity", params);
    const { data } = await supabase.rpc("list_my_social_graph", params);
    if (data) return normalizeSocialGraph(data, profileId);
  } catch (_) {}

  return createDefaultSocialGraph(profileId, profileName);
}

function normalizeSocialGraph(raw: any, profileId?: string | null): SocialGraph {
  const identity = raw.identity || {};
  const privacy = raw.privacy || {};

  const mapFriend = (f: any): SocialFriend => ({
    friendshipId: f.friendship_id || f.id || "",
    friendUserId: f.friend_user_id || f.user_id || "",
    status: f.status || "accepted",
    friendCode: f.friend_code || "",
    displayName: f.display_name || f.name || f.friend_code || "Ami MegaTv",
    friendProfileId: f.friend_profile_id || null,
    shareProfileId: f.share_profile_id || null,
    avatarId: f.avatar_id ?? 1,
    avatarImageStoragePath: f.avatar_image_storage_path || null,
    avatarImageVersion: f.avatar_image_version || 0,
    updatedAt: f.updated_at || null,
    nowPlayingTitle: f.now_playing_title || null,
    nowPlayingPoster: f.now_playing_poster || null
  });

  return {
    identity: {
      userId: identity.user_id || "",
      profileId: identity.profile_id || profileId || null,
      friendCode: identity.friend_code || "MEGA-" + Math.floor(1000 + Math.random() * 9000),
      displayName: identity.display_name || null,
      bio: identity.bio || null,
      shareProfileId: identity.share_profile_id || null
    },
    privacy: {
      ghostMode: Boolean(privacy.ghost_mode),
      shareWatching: privacy.share_watching !== false,
      shareWatchlist: privacy.share_watchlist !== false
    },
    friends: Array.isArray(raw.friends) ? raw.friends.map(mapFriend) : [],
    incoming: Array.isArray(raw.incoming) ? raw.incoming.map(mapFriend) : [],
    outgoing: Array.isArray(raw.outgoing) ? raw.outgoing.map(mapFriend) : [],
    acceptedCount: raw.acceptedCount ?? (Array.isArray(raw.friends) ? raw.friends.length : 0),
    atFriendLimit: Boolean(raw.atFriendLimit)
  };
}

function createDefaultSocialGraph(profileId?: string | null, profileName?: string | null): SocialGraph {
  return {
    identity: {
      userId: "",
      profileId: profileId || null,
      friendCode: "MEGA-" + Math.floor(1000 + Math.random() * 9000),
      displayName: profileName || null,
      bio: null,
      shareProfileId: profileId || null
    },
    privacy: {
      ghostMode: false,
      shareWatching: true,
      shareWatchlist: true
    },
    friends: [],
    incoming: [],
    outgoing: [],
    acceptedCount: 0,
    atFriendLimit: false
  };
}

export async function sendFriendRequestByCode(
  supabase: SupabaseClient,
  code: string,
  fromProfileId?: string | null,
  fromProfileName?: string | null
) {
  const norm = code.trim().toUpperCase();
  const { data, error } = await supabase.rpc("send_friend_request_by_code", {
    p_friend_code: norm,
    p_from_profile_id: fromProfileId || null,
    p_from_profile_name: fromProfileName || null
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function respondFriendRequest(
  supabase: SupabaseClient,
  friendshipId: string,
  accept: boolean
) {
  const { data, error } = await supabase.rpc("respond_friend_request", {
    p_friendship_id: friendshipId,
    p_accept: accept
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function removeFriendship(supabase: SupabaseClient, friendshipId: string) {
  const { data, error } = await supabase.rpc("remove_friendship", {
    p_friendship_id: friendshipId
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSocialPrivacy(
  supabase: SupabaseClient,
  patch: { ghostMode?: boolean; shareWatching?: boolean; shareWatchlist?: boolean }
) {
  const params: Record<string, unknown> = {};
  if (patch.ghostMode !== undefined) params.p_ghost_mode = patch.ghostMode;
  if (patch.shareWatching !== undefined) params.p_share_watching = patch.shareWatching;
  if (patch.shareWatchlist !== undefined) params.p_share_watchlist = patch.shareWatchlist;

  const { data, error } = await supabase.rpc("upsert_social_privacy", params);
  if (error) throw new Error(error.message);
  return data;
}

export async function listFriendShares(
  supabase: SupabaseClient,
  friendProfileId?: string | null,
  fromProfileId?: string | null
): Promise<{ sent: FriendWatchProposal[]; received: FriendWatchProposal[] }> {
  try {
    const { data, error } = await supabase.rpc("list_friend_shares", {
      p_friend_profile_id: friendProfileId || null,
      p_from_profile_id: fromProfileId || null
    });
    if (error || !data) return { sent: [], received: [] };

    const mapProposal = (p: any): FriendWatchProposal => ({
      id: p.id || "",
      fromUserId: p.from_user_id || "",
      fromProfileId: p.from_profile_id || null,
      toProfileId: p.to_profile_id || null,
      fromDisplayName: p.from_display_name || "Un ami",
      mediaType: p.media_type === "tv" ? "tv" : "movie",
      tmdbId: Number(p.tmdb_id) || 0,
      title: p.title || "",
      posterPath: p.poster_path || null,
      backdropPath: p.backdrop_path || null,
      createdAt: p.created_at || new Date().toISOString(),
      watchedAt: p.watched_at || null,
      watched: Boolean(p.watched_at)
    });

    return {
      sent: Array.isArray(data.sent) ? data.sent.map(mapProposal) : [],
      received: Array.isArray(data.received) ? data.received.map(mapProposal) : []
    };
  } catch (_) {
    return { sent: [], received: [] };
  }
}

export async function proposeFriendWatch(
  supabase: SupabaseClient,
  params: {
    friendUserId: string;
    mediaType: "movie" | "tv";
    tmdbId: number;
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    toProfileId?: string | null;
    fromProfileId?: string | null;
    fromDisplayName?: string | null;
  }
) {
  const { data, error } = await supabase.rpc("propose_friend_watch", {
    p_friend_user_id: params.friendUserId,
    p_media_type: params.mediaType,
    p_tmdb_id: params.tmdbId,
    p_title: params.title,
    p_poster_path: params.posterPath || null,
    p_backdrop_path: params.backdropPath || null,
    p_to_profile_id: params.toProfileId || null,
    p_from_profile_id: params.fromProfileId || null,
    p_from_display_name: params.fromDisplayName || null
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function createMatchSession(
  supabase: SupabaseClient,
  params: {
    friendUserId: string;
    deck: MatchDeckCard[];
    friendProfileId?: string | null;
    fromProfileId?: string | null;
  }
) {
  const { data, error } = await supabase.rpc("create_match_session", {
    p_friend_user_id: params.friendUserId,
    p_deck: params.deck,
    p_friend_profile_id: params.friendProfileId || null,
    p_from_profile_id: params.fromProfileId || null
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function listMatchSessions(
  supabase: SupabaseClient,
  profileId?: string | null
): Promise<FriendMatchSession[]> {
  try {
    const { data, error } = await supabase.rpc("list_my_match_sessions", {
      p_profile_id: profileId || null
    });
    if (error || !data || !Array.isArray(data)) return [];
    return data.map((d: any) => ({
      sessionId: d.session_id || d.id,
      friendUserId: d.friend_user_id || "",
      friendDisplayName: d.friend_display_name || "Ami",
      status: d.status || "active",
      matchedTitle: d.matched_title || null,
      matchedPoster: d.matched_poster || null,
      matchedTmdbId: d.matched_tmdb_id ? Number(d.matched_tmdb_id) : null,
      matchedMediaType: d.matched_media_type || null,
      createdAt: d.created_at || new Date().toISOString()
    }));
  } catch (_) {
    return [];
  }
}
