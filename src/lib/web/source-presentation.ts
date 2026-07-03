/** Parses stream title/labels into UI badges (parity SourcesSheet / StreamSelector). */
export type SourcePresentation = {
  title: string;
  addonLabel: string;
  badges: Array<{ label: string; tone: "good" | "gold" | "blue" | "pink" | "purple" | "cyan" | "muted" }>;
  sizeLabel: string | null;
  isCached: boolean;
};

const RES_PATTERNS: Array<{ re: RegExp; label: string; tone: SourcePresentation["badges"][0]["tone"] }> = [
  { re: /(2160p|\b4k\b|uhd)/i, label: "4K", tone: "gold" },
  { re: /dolby\s?vision|\bDV\b/i, label: "Dolby Vision", tone: "pink" },
  { re: /hdr10\+?/i, label: "HDR10+", tone: "purple" },
  { re: /\bhdr\b/i, label: "HDR", tone: "blue" },
  { re: /1080p|\bfhd\b/i, label: "1080p", tone: "blue" },
  { re: /720p/i, label: "720p", tone: "cyan" },
  { re: /multi[- ]?audio|multi[- ]?lang/i, label: "Multi-audio", tone: "muted" }
];

export function presentWebSource(input: {
  title: string;
  label?: string;
  groupLabel?: string;
  quality?: string;
  detail?: string | null;
}): SourcePresentation {
  const blob = `${input.title} ${input.label || ""} ${input.quality || ""} ${input.detail || ""}`;
  const title = input.title.trim() || input.label?.trim() || "Source";
  const addonLabel = input.groupLabel?.trim() || "Source";

  const badges: SourcePresentation["badges"] = [{ label: "Good", tone: "good" }];
  const seen = new Set<string>(["good"]);

  for (const entry of RES_PATTERNS) {
    if (!entry.re.test(blob)) continue;
    const key = entry.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    badges.push({ label: entry.label, tone: entry.tone });
  }

  if (input.quality && !seen.has(input.quality.toLowerCase())) {
    badges.push({ label: input.quality, tone: "blue" });
  }

  const sizeMatch = /([\d.]+\s?(?:GB|MB))/i.exec(blob);
  const sizeLabel = sizeMatch ? sizeMatch[1].toUpperCase().replace(/\s+/g, " ") : null;

  return {
    title,
    addonLabel,
    badges,
    sizeLabel,
    isCached: /cache|instant|👤/i.test(blob)
  };
}
