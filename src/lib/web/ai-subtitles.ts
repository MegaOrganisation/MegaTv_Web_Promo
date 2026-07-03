import { toVtt } from "@/lib/web/subtitles";

/**
 * AI subtitle translation seam (see logique_sous_titres_ai).
 *
 * The Android app translates an English `.srt` on-device/remotely when the
 * target-language subtitle is missing. In the browser we expose the same seam:
 * if `AI_SUBTITLE_ENDPOINT` is configured, we POST the source VTT + target lang
 * and serve the translated VTT. Otherwise this is a clearly-stubbed no-op
 * (standard external subtitle tracks still work) — no fake translation is
 * fabricated.
 */
export function isAiSubtitleEnabled(): boolean {
  return Boolean(process.env.AI_SUBTITLE_ENDPOINT?.trim());
}

export type AiSubtitleRequest = {
  sourceUrl: string;
  targetLang: string;
};

export type AiSubtitleResult =
  | { ok: true; vtt: string }
  | { ok: false; reason: "disabled" | "error" };

export async function translateSubtitle(req: AiSubtitleRequest): Promise<AiSubtitleResult> {
  const endpoint = process.env.AI_SUBTITLE_ENDPOINT?.trim();
  if (!endpoint) return { ok: false, reason: "disabled" };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AI_SUBTITLE_API_KEY ? { Authorization: `Bearer ${process.env.AI_SUBTITLE_API_KEY}` } : {})
      },
      body: JSON.stringify({ source_url: req.sourceUrl, target_lang: req.targetLang }),
      cache: "no-store"
    });
    if (!res.ok) return { ok: false, reason: "error" };
    const data = (await res.json()) as { vtt?: string; srt?: string; content?: string };
    const raw = data.vtt || data.srt || data.content;
    if (!raw) return { ok: false, reason: "error" };
    return { ok: true, vtt: toVtt(raw) };
  } catch {
    return { ok: false, reason: "error" };
  }
}
