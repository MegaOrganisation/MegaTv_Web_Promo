import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchSocialGraph,
  sendFriendRequestByCode,
  respondFriendRequest,
  removeFriendship,
  updateSocialPrivacy,
  listFriendShares,
  proposeFriendWatch,
  createMatchSession,
  listMatchSessions
} from "@/lib/companion/social";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId") || null;
  const profileName = url.searchParams.get("profileName") || null;

  try {
    const [graph, shares, matchSessions] = await Promise.all([
      fetchSocialGraph(supabase, profileId, profileName),
      listFriendShares(supabase, null, profileId),
      listMatchSessions(supabase, profileId)
    ]);

    return NextResponse.json({
      success: true,
      graph,
      shares,
      matchSessions
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur de chargement" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case "send_friend_request": {
        const { code, fromProfileId, fromProfileName } = body;
        if (!code) return NextResponse.json({ error: "Code requis" }, { status: 400 });
        const res = await sendFriendRequestByCode(supabase, code, fromProfileId, fromProfileName);
        return NextResponse.json({ success: true, data: res });
      }

      case "respond_request": {
        const { friendshipId, accept } = body;
        if (!friendshipId) return NextResponse.json({ error: "Demande invalide" }, { status: 400 });
        const res = await respondFriendRequest(supabase, friendshipId, Boolean(accept));
        return NextResponse.json({ success: true, data: res });
      }

      case "remove_friend": {
        const { friendshipId } = body;
        if (!friendshipId) return NextResponse.json({ error: "Identifiant ami requis" }, { status: 400 });
        const res = await removeFriendship(supabase, friendshipId);
        return NextResponse.json({ success: true, data: res });
      }

      case "update_privacy": {
        const { ghostMode, shareWatching, shareWatchlist } = body;
        const res = await updateSocialPrivacy(supabase, { ghostMode, shareWatching, shareWatchlist });
        return NextResponse.json({ success: true, data: res });
      }

      case "propose_watch": {
        const { friendUserId, mediaType, tmdbId, title, posterPath, backdropPath, toProfileId, fromProfileId, fromDisplayName } = body;
        if (!friendUserId || !tmdbId || !title) {
          return NextResponse.json({ error: "Informations de partage incomplètes" }, { status: 400 });
        }
        const res = await proposeFriendWatch(supabase, {
          friendUserId,
          mediaType: mediaType || "movie",
          tmdbId,
          title,
          posterPath,
          backdropPath,
          toProfileId,
          fromProfileId,
          fromDisplayName
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "create_match_session": {
        const { friendUserId, deck, friendProfileId, fromProfileId } = body;
        if (!friendUserId || !Array.isArray(deck)) {
          return NextResponse.json({ error: "Session de match invalide" }, { status: 400 });
        }
        const res = await createMatchSession(supabase, {
          friendUserId,
          deck,
          friendProfileId,
          fromProfileId
        });
        return NextResponse.json({ success: true, data: res });
      }

      default:
        return NextResponse.json({ error: `Action inconnue: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
