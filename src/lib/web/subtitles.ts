/**
 * Subtitle helpers for the web player. Browsers only render WebVTT via
 * `<track>`, so SRT (the most common Stremio/OpenSubtitles format) is converted
 * server-side before being served.
 */

/** True when the payload already looks like WebVTT. */
export function isVtt(text: string): boolean {
  return /^\uFEFF?WEBVTT/.test(text.trimStart());
}

/** Converts an SRT string to WebVTT (timestamps `,` → `.`, WEBVTT header). */
export function srtToVtt(srt: string): string {
  const body = srt
    .replace(/^\uFEFF/, "")
    .replace(/\r+/g, "")
    // 00:00:01,000 --> 00:00:04,000  =>  00:00:01.000 --> 00:00:04.000
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `WEBVTT\n\n${body.trim()}\n`;
}

/** Normalizes any subtitle payload to WebVTT. */
export function toVtt(text: string): string {
  return isVtt(text) ? text : srtToVtt(text);
}
