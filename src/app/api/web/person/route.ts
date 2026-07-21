import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { fetchTmdbPerson, tmdbImageUrl } from "@/lib/tmdb";
import { encodeMediaId } from "@/lib/web/media";

export const dynamic = "force-dynamic";

export type WebPersonCredit = {
  mediaId: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  character: string | null;
  year: string | null;
  posterUrl: string | null;
};

export type WebPerson = {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  placeOfBirth: string | null;
  profileUrl: string | null;
  credits: WebPersonCredit[];
};

/**
 * Lazy actor bio + filmography for the details ActorModal. Fetched only when a
 * cast member is opened (cached client-side + 24h server cache via fetchTmdbPerson)
 * to respect the Free-Tier.
 */
export async function GET(request: Request) {
  await requireUser();

  const personId = Number(new URL(request.url).searchParams.get("personId"));
  if (!Number.isFinite(personId) || personId <= 0) {
    return NextResponse.json({ error: "personId requis" }, { status: 400 });
  }

  const person = await fetchTmdbPerson(personId);
  if (!person) {
    return NextResponse.json({ error: "introuvable" }, { status: 404 });
  }

  const seen = new Set<string>();
  const credits = (person.combined_credits?.cast || [])
    .filter((credit) => {
      const type = credit.media_type === "tv" ? "tv" : credit.media_type === "movie" ? "movie" : null;
      if (!type || !credit.id || !credit.poster_path) return false;
      const key = `${type}-${credit.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map<WebPersonCredit>((credit) => {
      const mediaType = credit.media_type === "tv" ? "tv" : "movie";
      const date = credit.release_date || credit.first_air_date || "";
      return {
        mediaId: encodeMediaId(mediaType, credit.id),
        mediaType,
        tmdbId: credit.id,
        title: credit.title || credit.name || "",
        character: credit.character || null,
        year: date ? date.slice(0, 4) : null,
        posterUrl: tmdbImageUrl(credit.poster_path, "w342")
      };
    })
    .sort((a, b) => {
      const ya = Number(a.year) || 0;
      const yb = Number(b.year) || 0;
      return yb - ya;
    })
    .slice(0, 30);

  const payload: WebPerson = {
    id: person.id,
    name: person.name || "",
    biography: person.biography || "",
    birthday: person.birthday ?? null,
    placeOfBirth: person.place_of_birth ?? null,
    profileUrl: tmdbImageUrl(person.profile_path, "w342"),
    credits
  };

  return NextResponse.json({ person: payload });
}
