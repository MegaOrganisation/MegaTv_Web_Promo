import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        profile: null
      });
    }

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, name, avatar_id, avatar_image_version, avatar_image_storage_path, avatar_color")
      .eq("user_id", user.id)
      .order("last_used_at", { ascending: false, nullsFirst: false })
      .limit(1);

    const activeProfile = profiles && profiles.length > 0 ? profiles[0] : null;

    let avatarUrl: string | null = null;
    let displayName = user.email ? user.email.split("@")[0] : "Mon Compte";

    if (activeProfile) {
      if (activeProfile.name) displayName = activeProfile.name;
      const path = activeProfile.avatar_image_storage_path?.trim();
      if (path && (path.startsWith("http://") || path.startsWith("https://"))) {
        avatarUrl = path;
      } else if (path || (activeProfile.avatar_image_version || 0) > 0) {
        avatarUrl = `/api/profiles/${encodeURIComponent(activeProfile.id)}/avatar?v=${activeProfile.avatar_image_version || 1}`;
      } else if (activeProfile.avatar_id && activeProfile.avatar_id > 0) {
        const num = Math.min(Math.max(activeProfile.avatar_id, 1), 20);
        avatarUrl = `/assets/avatars/avatar_${num}.png`;
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: activeProfile
        ? {
            id: activeProfile.id,
            name: displayName,
            avatar_url: avatarUrl,
            avatar_id: activeProfile.avatar_id
          }
        : {
            id: null,
            name: displayName,
            avatar_url: null,
            avatar_id: null
          }
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, user: null, profile: null, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
