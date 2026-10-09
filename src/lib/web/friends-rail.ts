import { createClient } from "@/lib/supabase/server";

export type FriendRailEntry = {
  friendUserId: string;
  friendProfileId: string | null;
  displayName: string;
  avatarId: number;
  avatarImageStoragePath: string | null;
  avatarImageVersion: number;
  ring: "active" | "dim";
  nowPlayingTitle: string | null;
  nowPlayingPoster: string | null;
};

/**
 * Home « Vos amis » rail — RPC `friend_activity_rail` (profile-scoped).
 * Kids viewers: caller should skip mounting the rail (Android parity).
 */
export async function fetchFriendsRail(
  profileId: string,
  profileName?: string | null
): Promise<FriendRailEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("friend_activity_rail", {
      p_profile_id: profileId,
      p_profile_name: profileName || null
    });
    if (error || !data) return [];
    const rows = Array.isArray(data) ? data : [];
    return rows.map((row: Record<string, unknown>) => ({
      friendUserId: String(row.friend_user_id || ""),
      friendProfileId: (row.friend_profile_id as string) || null,
      displayName: String(row.display_name || row.friend_code || "Ami"),
      avatarId: Number(row.avatar_id) || 1,
      avatarImageStoragePath: (row.avatar_image_storage_path as string) || null,
      avatarImageVersion: Number(row.avatar_image_version) || 0,
      ring: row.ring === "active" ? "active" : "dim",
      nowPlayingTitle: (row.now_playing_title as string) || null,
      nowPlayingPoster: (row.now_playing_poster as string) || null
    }));
  } catch {
    return [];
  }
}
