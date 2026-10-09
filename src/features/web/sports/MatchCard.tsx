"use client";

import { clsx } from "clsx";
import { Play, Tv } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { IptvChannel } from "@/lib/web/iptv-channels";
import type { SportMatch } from "./types";

type Props = {
  match: SportMatch;
  matchedChannels?: IptvChannel[];
  onClick: () => void;
  onWatchDirect?: (channel: IptvChannel) => void;
};

function formatKickoffTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return isToday ? `${hh}:${mm}` : `${d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })} ${hh}:${mm}`;
  } catch {
    return "À venir";
  }
}

export function TeamLogo({
  url,
  name,
  size = 48
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  const [error, setError] = useState(false);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  if (!url || error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="grid shrink-0 place-items-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-inner"
      >
        <span className="text-xs font-black tracking-wider text-white/80">{initials || "TV"}</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-1.5 shadow-sm"
    >
      <Image
        src={url}
        alt={name}
        fill
        sizes={`${size}px`}
        className="object-contain p-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        onError={() => setError(true)}
        unoptimized
      />
    </div>
  );
}

export function MatchCard({ match, matchedChannels = [], onClick, onWatchDirect }: Props) {
  const isLive = match.status === "LIVE";
  const primaryMatched = matchedChannels[0] || null;
  const broadcaster = match.primaryBroadcaster || (primaryMatched ? primaryMatched.name : null);

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (primaryMatched && onWatchDirect) {
      onWatchDirect(primaryMatched);
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={clsx(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[var(--mega-surface)] p-4 text-left transition-all duration-300",
        "cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mega-focus)]",
        isLive
          ? "border-[var(--mega-red)]/50 shadow-[0_0_25px_-5px_rgba(229,57,53,0.18)] hover:border-[var(--mega-red)]"
          : "border-[var(--mega-border)] hover:border-[var(--mega-border-strong)]"
      )}
    >
      {/* Background radial gradient accent */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-75",
          isLive
            ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--mega-red)]/15 via-transparent to-transparent"
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--mega-accent)]/10 via-transparent to-transparent"
        )}
      />

      {/* Top Header: Tournament & Status */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="truncate block text-[11px] font-bold uppercase tracking-wider text-[var(--mega-text-muted)]">
            {match.tournamentName}
          </span>
          {match.round ? (
            <span className="truncate block text-[10px] text-[var(--mega-text-faint)]">
              {match.round}
            </span>
          ) : null}
        </div>

        {/* Live Badge or Kickoff Time */}
        {isLive ? (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--mega-red)]/90 px-2.5 py-1 shadow-[0_0_12px_rgba(229,57,53,0.6)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-white">LIVE</span>
            {match.minute ? (
              <span className="border-l border-white/30 pl-1.5 text-[11px] font-bold text-white/95">
                {match.minute}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--mega-text-muted)]">
            {formatKickoffTime(match.matchTime)}
          </span>
        )}
      </div>

      {/* Center Teams & Scores */}
      <div className="relative z-10 my-4 flex items-center justify-between gap-3">
        {/* Home Team */}
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <TeamLogo url={match.homeTeamBadge} name={match.homeTeamName} size={48} />
          <span className="mt-2 line-clamp-1 w-full text-xs font-bold text-[var(--mega-text)]">
            {match.homeTeamName}
          </span>
        </div>

        {/* Score or VS */}
        <div className="flex shrink-0 flex-col items-center px-2">
          {match.score ? (
            <div className="flex flex-col items-center">
              <span className="text-xl font-black tracking-tight text-white drop-shadow-sm sm:text-2xl">
                {match.score}
              </span>
              {match.period ? (
                <span className="mt-0.5 text-[10px] font-medium text-[var(--mega-text-faint)]">
                  {match.period}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-[11px] font-black tracking-widest text-[var(--mega-text-faint)]">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <TeamLogo url={match.awayTeamBadge} name={match.awayTeamName} size={48} />
          <span className="mt-2 line-clamp-1 w-full text-xs font-bold text-[var(--mega-text)]">
            {match.awayTeamName}
          </span>
        </div>
      </div>

      {/* Footer: Broadcaster & Action Button */}
      <div className="relative z-10 mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        {/* Broadcaster pill */}
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--mega-text-muted)]">
          <Tv className="h-3.5 w-3.5 shrink-0 text-[var(--mega-text-faint)]" />
          <span className="truncate font-medium">
            {broadcaster || "Flux en direct"}
          </span>
          {primaryMatched ? (
            <span
              title="Chaîne trouvée dans votre playlist IPTV !"
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--mega-green)] shadow-[0_0_8px_rgba(0,213,136,0.6)]"
            />
          ) : null}
        </div>

        {/* Direct Watch Button */}
        <button
          type="button"
          onClick={handleWatchClick}
          className={clsx(
            "focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
            isLive
              ? "bg-[var(--mega-red)] text-white hover:bg-[var(--mega-red)]/90 shadow-[0_4px_14px_rgba(229,57,53,0.4)]"
              : "border border-white/10 bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <Play className="h-3 w-3 fill-current" />
          <span>Regarder</span>
        </button>
      </div>
    </div>
  );
}
