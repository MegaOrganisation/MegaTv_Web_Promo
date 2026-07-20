import { NextResponse } from "next/server";

import { OTA_GITHUB_REPO, OTA_VERSION_JSON_URL } from "@/lib/supabase/admin";

/**
 * Lien APK toujours à jour :
 * 1) `updates/version.json` (Supabase) → champ `url`
 * 2) fallback GitHub Releases latest (asset .apk)
 * 3) fallback page releases
 */
export async function GET() {
  const releasesPage = `https://github.com/${OTA_GITHUB_REPO}/releases`;

  try {
    const manifestRes = await fetch(OTA_VERSION_JSON_URL, { next: { revalidate: 120 } });
    if (manifestRes.ok) {
      const manifest = (await manifestRes.json()) as { url?: string };
      if (manifest.url && /^https:\/\/github\.com\/MegaOrganisation\/MegaTv_Web_Auth\/releases\//.test(manifest.url)) {
        return NextResponse.redirect(manifest.url, 302);
      }
    }
  } catch {
    // continue
  }

  try {
    const gh = await fetch(`https://api.github.com/repos/${OTA_GITHUB_REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "MegaTv-Promo" },
      next: { revalidate: 300 }
    });
    if (gh.ok) {
      const data = (await gh.json()) as {
        assets?: Array<{ name: string; browser_download_url: string }>;
        html_url?: string;
      };
      const apk = data.assets?.find((a) => a.name.toLowerCase().endsWith(".apk"));
      if (apk?.browser_download_url) {
        return NextResponse.redirect(apk.browser_download_url, 302);
      }
      if (data.html_url) {
        return NextResponse.redirect(data.html_url, 302);
      }
    }
  } catch {
    // continue
  }

  return NextResponse.redirect(releasesPage, 302);
}
