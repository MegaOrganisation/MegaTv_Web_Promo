import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient, OTA_GITHUB_REPO, OTA_VERSION_JSON_URL } from "@/lib/supabase/admin";
import type { VersionManifest } from "@/lib/companion/sync-types";

export async function GET() {
  await requireAdmin();

  const [manifestRes, githubRes] = await Promise.all([
    fetch(OTA_VERSION_JSON_URL, { next: { revalidate: 60 } }),
    fetch(`https://api.github.com/repos/${OTA_GITHUB_REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "MegaCompagnon" },
      next: { revalidate: 120 }
    }).catch(() => null)
  ]);

  const manifest = manifestRes.ok ? ((await manifestRes.json()) as VersionManifest) : null;
  const github = githubRes?.ok
    ? ((await githubRes.json()) as {
        tag_name?: string;
        html_url?: string;
        published_at?: string;
        assets?: Array<{ name: string; browser_download_url: string }>;
      })
    : null;

  return NextResponse.json({
    manifest,
    manifestError: manifestRes.ok ? null : `HTTP ${manifestRes.status}`,
    github: github
      ? {
          tag: github.tag_name,
          url: github.html_url,
          publishedAt: github.published_at,
          apkAsset: github.assets?.find((a) => a.name.endsWith(".apk"))?.browser_download_url ?? null
        }
      : null,
    serviceRoleConfigured: Boolean(createServiceClient())
  });
}

export async function POST(request: Request) {
  await requireAdmin();
  const service = createServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manquant — configurez la variable sur Vercel pour publier version.json." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as VersionManifest;
  if (!body.versionCode || !body.versionName || !body.url) {
    return NextResponse.json({ error: "versionCode, versionName et url sont requis" }, { status: 400 });
  }

  const payload: VersionManifest = {
    versionCode: Number(body.versionCode),
    versionName: String(body.versionName),
    url: String(body.url),
    features: Array.isArray(body.features) ? body.features.filter(Boolean) : [],
    fixes: Array.isArray(body.fixes) ? body.fixes.filter(Boolean) : [],
    improvements: Array.isArray(body.improvements) ? body.improvements.filter(Boolean) : []
  };

  const { error } = await service.storage.from("updates").upload("version.json", JSON.stringify(payload, null, 2), {
    contentType: "application/json",
    upsert: true
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, publicUrl: OTA_VERSION_JSON_URL });
}
