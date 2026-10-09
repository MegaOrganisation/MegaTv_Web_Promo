"use client";

import { clsx } from "clsx";
import { CheckCircle2, ChevronRight, ExternalLink, Play, Radio, Tv, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { TvLivePlayer } from "@/features/web/tv/TvLivePlayer";
import { useWebProfile } from "@/features/web/WebProfileProvider";
import type { IptvChannel } from "@/lib/web/iptv-channels";
import { TeamLogo } from "./MatchCard";
import type { SportMatch } from "./types";

type Props = {
  match: SportMatch;
  matchedChannels: IptvChannel[];
  onClose: () => void;
};

export function MatchDetailsModal({ match, matchedChannels, onClose }: Props) {
  const { withProfile, activeProfile } = useWebProfile();
  const [selectedChannel, setSelectedChannel] = useState<IptvChannel | null>(
    matchedChannels[0] || null
  );
  const [playingInline, setPlayingInline] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const isLive = match.status === "LIVE";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Scrim backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--mega-border-strong)] bg-[var(--mega-surface-raised)] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--mega-text-muted)]">
              {match.tournamentName}
            </span>
            {match.round ? (
              <span className="ml-2 text-xs text-[var(--mega-text-faint)]">· {match.round}</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mega-red)] px-3 py-1 text-xs font-extrabold tracking-wider text-white shadow-[0_0_12px_rgba(229,57,53,0.5)]">
                <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                LIVE {match.minute ? `· ${match.minute}` : ""}
              </span>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Inline Live Stream Player if active */}
          {playingInline && selectedChannel ? (
            <div className="space-y-2">
              <TvLivePlayer
                channel={selectedChannel}
                subtitle={`${match.tournamentName} • ${match.homeTeamName} vs ${match.awayTeamName}`}
                onClose={() => setPlayingInline(false)}
              />
              <div className="flex items-center justify-between text-xs text-[var(--mega-text-muted)]">
                <span>Lecture en direct : {selectedChannel.name}</span>
                <Link
                  href={withProfile(`/web/tv?channel=${encodeURIComponent(selectedChannel.id)}`)}
                  className="inline-flex items-center gap-1 font-semibold text-[var(--mega-accent)] hover:underline"
                >
                  Ouvrir en plein écran sur TV en direct <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            /* Teams & Score Display */
            <div className="rounded-2xl border border-white/5 bg-black/40 p-6">
              <div className="flex items-center justify-around gap-4 text-center">
                {/* Home Team */}
                <div className="flex flex-1 flex-col items-center">
                  <TeamLogo url={match.homeTeamBadge} name={match.homeTeamName} size={72} />
                  <span className="mt-3 text-base font-extrabold text-white sm:text-lg">
                    {match.homeTeamName}
                  </span>
                  <span className="text-xs text-[var(--mega-text-faint)]">Domicile</span>
                </div>

                {/* Score / Center */}
                <div className="flex flex-col items-center px-4">
                  {match.score ? (
                    <>
                      <span className="text-3xl font-black tracking-wider text-white drop-shadow sm:text-5xl">
                        {match.score}
                      </span>
                      <span className="mt-1 text-xs font-semibold uppercase text-[var(--mega-red)]">
                        {isLive ? match.minute || "En direct" : "Terminé"}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-sm font-black tracking-widest text-white/50">
                        VS
                      </div>
                      <span className="mt-2 text-xs font-semibold text-[var(--mega-text-muted)]">
                        Coup d&apos;envoi {new Date(match.matchTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex flex-1 flex-col items-center">
                  <TeamLogo url={match.awayTeamBadge} name={match.awayTeamName} size={72} />
                  <span className="mt-3 text-base font-extrabold text-white sm:text-lg">
                    {match.awayTeamName}
                  </span>
                  <span className="text-xs text-[var(--mega-text-faint)]">Extérieur</span>
                </div>
              </div>

              {match.venue ? (
                <p className="mt-4 text-center text-xs text-[var(--mega-text-faint)]">
                  Stade / Lieu : {match.venue}
                </p>
              ) : null}
            </div>
          )}

          {/* Broadcaster Resolution & Watch Actions */}
          <div className="rounded-2xl border border-white/10 bg-[var(--mega-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[var(--mega-accent)]" />
                <h3 className="text-sm font-bold text-white">Diffusion & Chaînes IPTV</h3>
              </div>
              {matchedChannels.length > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mega-green)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--mega-green)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {matchedChannels.length} chaîne{matchedChannels.length > 1 ? "s" : ""} disponible{matchedChannels.length > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-xs text-[var(--mega-text-faint)]">Playlist du profil</span>
              )}
            </div>

            {matchedChannels.length > 0 ? (
              <div className="space-y-3">
                {/* Channel selector buttons if multiple */}
                {matchedChannels.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {matchedChannels.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setSelectedChannel(ch)}
                        className={clsx(
                          "focus-ring inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                          selectedChannel?.id === ch.id
                            ? "border-[var(--mega-accent)] bg-[var(--mega-accent)]/20 text-white"
                            : "border-white/10 bg-white/5 text-[var(--mega-text-muted)] hover:border-white/20 hover:text-white"
                        )}
                      >
                        <Tv className="h-3 w-3" />
                        <span className="truncate max-w-[140px]">{ch.name}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* Primary Watch Action */}
                {selectedChannel ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setPlayingInline(true)}
                      className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--mega-accent)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--mega-accent)]/30 transition hover:bg-[var(--mega-accent-bright)]"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Regarder maintenant ({selectedChannel.name})
                    </button>

                    <Link
                      href={withProfile(`/web/tv?channel=${encodeURIComponent(selectedChannel.id)}`)}
                      className="focus-ring flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                    >
                      <span>Ouvrir sur TV</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : (
              /* No matching IPTV channel in user's playlist */
              <div className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/90">
                    Diffuseur officiel : {match.primaryBroadcaster || "Diffuseurs partenaires"}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-[var(--mega-text-muted)]">
                    Non configuré
                  </span>
                </div>
                <p className="text-xs text-[var(--mega-text-faint)]">
                  Ce match est diffusé sur {match.primaryBroadcaster || "les chaînes sportives officielles"}.
                  Cette chaîne n&apos;est pas détectée dans la playlist IPTV active ({activeProfile?.name || "Profil"}).
                </p>
                <div className="pt-2">
                  <Link
                    href={withProfile("/web/tv")}
                    className="focus-ring inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mega-accent)] hover:underline"
                  >
                    Explorer toutes les chaînes TV en direct <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Lineup / Compositions (Parity with Android DemoPlayer) */}
          {match.lineups ? (
            <div className="rounded-2xl border border-white/5 bg-[var(--mega-surface)] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Compositions / Joueurs Clés</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Home Roster */}
                <div>
                  <span className="block border-b border-white/10 pb-1 text-xs font-bold text-[var(--mega-text-muted)]">
                    {match.homeTeamName}
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {match.lineups.home.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="w-5 font-mono text-[var(--mega-text-faint)]">{p.num}</span>
                        <span className="w-6 rounded bg-white/10 px-1 py-0.2 text-center text-[10px] font-bold text-[var(--mega-text-muted)]">
                          {p.pos}
                        </span>
                        <span className="font-medium text-white/90">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away Roster */}
                <div>
                  <span className="block border-b border-white/10 pb-1 text-xs font-bold text-[var(--mega-text-muted)]">
                    {match.awayTeamName}
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {match.lineups.away.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="w-5 font-mono text-[var(--mega-text-faint)]">{p.num}</span>
                        <span className="w-6 rounded bg-white/10 px-1 py-0.2 text-center text-[10px] font-bold text-[var(--mega-text-muted)]">
                          {p.pos}
                        </span>
                        <span className="font-medium text-white/90">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
