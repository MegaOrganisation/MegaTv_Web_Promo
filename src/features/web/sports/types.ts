import type { IptvChannel } from "@/lib/web/iptv-channels";

export type SportDiscipline =
  | "all"
  | "football"
  | "basketball"
  | "tennis"
  | "motorsport"
  | "rugby"
  | "combat";

export type SportTabItem = {
  id: SportDiscipline;
  label: string;
  emoji: string;
};

export type PlayerRosterItem = {
  num: string;
  pos: string;
  name: string;
};

export type SportMatch = {
  id: string;
  sport: SportDiscipline;
  tournamentName: string;
  homeTeamName: string;
  homeTeamBadge: string | null;
  awayTeamName: string;
  awayTeamBadge: string | null;
  matchTime: string; // ISO date string
  status: "LIVE" | "UPCOMING" | "FINISHED";
  score: string | null; // e.g. "2 - 1"
  minute: string | null; // e.g. "68'", "35'", "Q3 04:12", "Set 2 5-3", "Tour 42/78"
  period?: string | null; // e.g. "2ème mi-temps", "3ème quart-temps", "2ème set"
  broadcasters: Record<string, string[]>; // e.g. { "FR": ["Canal+ Sport", "beIN SPORTS 1"], "ES": ["Movistar"] }
  primaryBroadcaster?: string | null;
  sourceUrl?: string | null;
  lineups?: {
    home: PlayerRosterItem[];
    away: PlayerRosterItem[];
  };
  venue?: string | null;
  round?: string | null;
};

export type ResolvedMatchChannel = {
  match: SportMatch;
  matchedChannels: IptvChannel[];
  primaryChannel: IptvChannel | null;
};
