import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await context.params;
    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tmdbUrl = formData.get("tmdbUrl") as string | null;

    const version = Date.now();

    if (tmdbUrl) {
      // Cas TMDB cover sélectionnée
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          cover_type: "tmdb",
          cover_value: tmdbUrl,
          cover_version: version,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("id", profileId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        coverType: "tmdb",
        coverValue: tmdbUrl,
        version
      });
    }

    if (!file) {
      return NextResponse.json({ error: "No file or tmdbUrl provided" }, { status: 400 });
    }

    // Restriction de taille maximale : 150 Ko max pour protéger le quota Supabase
    if (file.size > 200 * 1024) {
      return NextResponse.json({ error: "L'image dépasse la taille maximale autorisée (200 Ko max)" }, { status: 400 });
    }

    const storagePath = `${user.id}/${profileId}/${version}.jpg`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("profile-covers")
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "31536000"
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from("profile-covers")
      .getPublicUrl(storagePath);

    const publicUrl = publicData?.publicUrl || "";

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        cover_type: "custom",
        cover_value: publicUrl,
        cover_version: version,
        cover_image_storage_path: storagePath,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)
      .eq("id", profileId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      coverType: "custom",
      coverValue: publicUrl,
      storagePath,
      version
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
