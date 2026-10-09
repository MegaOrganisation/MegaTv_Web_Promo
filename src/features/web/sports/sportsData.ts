import type { SportDiscipline, SportMatch, SportTabItem } from "./types";

export const SPORT_TABS: SportTabItem[] = [
  { id: "all", label: "Tous", emoji: "🏆" },
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "motorsport", label: "Formule 1", emoji: "🏎️" },
  { id: "rugby", label: "Rugby", emoji: "🏉" },
  { id: "combat", label: "Combat/UFC", emoji: "🥊" }
];

export const DEMO_LINEUPS = {
  football: {
    home: [
      { num: "1", pos: "G", name: "Thibaut Courtois" },
      { num: "2", pos: "D", name: "Dani Carvajal" },
      { num: "3", pos: "D", name: "Éder Militão" },
      { num: "22", pos: "D", name: "Antonio Rüdiger" },
      { num: "23", pos: "D", name: "Ferland Mendy" },
      { num: "8", pos: "M", name: "Federico Valverde" },
      { num: "14", pos: "M", name: "Aurélien Tchouaméni" },
      { num: "5", pos: "M", name: "Jude Bellingham" },
      { num: "11", pos: "A", name: "Rodrygo" },
      { num: "9", pos: "A", name: "Kylian Mbappé" },
      { num: "7", pos: "A", name: "Vinícius Júnior" }
    ],
    away: [
      { num: "31", pos: "G", name: "Ederson" },
      { num: "2", pos: "D", name: "Kyle Walker" },
      { num: "3", pos: "D", name: "Rúben Dias" },
      { num: "25", pos: "D", name: "Manuel Akanji" },
      { num: "24", pos: "D", name: "Josko Gvardiol" },
      { num: "16", pos: "M", name: "Rodri" },
      { num: "8", pos: "M", name: "Mateo Kovacic" },
      { num: "17", pos: "M", name: "Kevin De Bruyne" },
      { num: "20", pos: "M", name: "Bernardo Silva" },
      { num: "47", pos: "A", name: "Phil Foden" },
      { num: "9", pos: "A", name: "Erling Haaland" }
    ]
  },
  basketball: {
    home: [
      { num: "23", pos: "F", name: "LeBron James" },
      { num: "3", pos: "C", name: "Anthony Davis" },
      { num: "15", pos: "G", name: "Austin Reaves" },
      { num: "1", pos: "G", name: "D'Angelo Russell" },
      { num: "28", pos: "F", name: "Rui Hachimura" }
    ],
    away: [
      { num: "0", pos: "F", name: "Jayson Tatum" },
      { num: "7", pos: "G", name: "Jaylen Brown" },
      { num: "4", pos: "G", name: "Jrue Holiday" },
      { num: "9", pos: "G", name: "Derrick White" },
      { num: "8", pos: "C", name: "Kristaps Porzingis" }
    ]
  },
  tennis: {
    home: [{ num: "1", pos: "S", name: "Carlos Alcaraz (ATP #3)" }],
    away: [{ num: "2", pos: "S", name: "Jannik Sinner (ATP #1)" }]
  },
  motorsport: {
    home: [
      { num: "1", pos: "P1", name: "Max Verstappen (Red Bull)" },
      { num: "16", pos: "P2", name: "Charles Leclerc (Ferrari)" },
      { num: "4", pos: "P3", name: "Lando Norris (McLaren)" }
    ],
    away: [
      { num: "44", pos: "P4", name: "Lewis Hamilton (Mercedes)" },
      { num: "81", pos: "P5", name: "Oscar Piastri (McLaren)" },
      { num: "55", pos: "P6", name: "Carlos Sainz (Ferrari)" }
    ]
  },
  rugby: {
    home: [
      { num: "9", pos: "M", name: "Antoine Dupont" },
      { num: "10", pos: "O", name: "Romain Ntamack" },
      { num: "15", pos: "A", name: "Thomas Ramos" },
      { num: "8", pos: "3L", name: "François Cros" },
      { num: "1", pos: "P", name: "Cyril Baille" }
    ],
    away: [
      { num: "8", pos: "3L", name: "Grégory Alldritt" },
      { num: "10", pos: "O", name: "Antoine Hastoy" },
      { num: "15", pos: "A", name: "Brice Dulin" },
      { num: "1", pos: "P", name: "Reda Wardi" },
      { num: "4", pos: "2L", name: "Will Skelton" }
    ]
  },
  combat: {
    home: [{ num: "C", pos: "CHAMP", name: "Islam Makhachev (26-1)" }],
    away: [{ num: "#1", pos: "CONT", name: "Arman Tsarukyan (22-3)" }]
  }
};

/**
 * Generates an active, lively sports guide with current timestamps and scores.
 */
export function generateCuratedLiveMatches(): SportMatch[] {
  const now = new Date();

  // Helper to get formatted ISO around now
  const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000).toISOString();
  const _minutesAhead = (mins: number) => new Date(now.getTime() + mins * 60 * 1000).toISOString();
  void _minutesAhead;
  const hoursAhead = (hrs: number) => new Date(now.getTime() + hrs * 3600 * 1000).toISOString();

  return [
    // =========================================================================
    // FOOTBALL
    // =========================================================================
    {
      id: "live-foot-1",
      sport: "football",
      tournamentName: "Ligue des Champions",
      round: "Quart de Finale - Aller",
      venue: "Santiago Bernabéu, Madrid",
      homeTeamName: "Real Madrid",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
      awayTeamName: "Manchester City",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
      matchTime: minutesAgo(72),
      status: "LIVE",
      score: "2 - 1",
      minute: "72'",
      period: "2ème mi-temps",
      broadcasters: {
        FR: ["Canal+ Foot", "Canal+", "RMC Sport 1"],
        UK: ["TNT Sports 1"],
        ES: ["Movistar Liga de Campeones"]
      },
      primaryBroadcaster: "Canal+ Foot",
      lineups: DEMO_LINEUPS.football
    },
    {
      id: "live-foot-2",
      sport: "football",
      tournamentName: "Ligue des Champions",
      round: "Quart de Finale - Aller",
      venue: "Parc des Princes, Paris",
      homeTeamName: "Paris Saint-Germain",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
      awayTeamName: "Arsenal",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
      matchTime: minutesAgo(54),
      status: "LIVE",
      score: "1 - 1",
      minute: "54'",
      period: "2ème mi-temps",
      broadcasters: {
        FR: ["Canal+", "beIN SPORTS 1"],
        UK: ["TNT Sports 2"]
      },
      primaryBroadcaster: "Canal+",
      lineups: DEMO_LINEUPS.football
    },
    {
      id: "today-foot-1",
      sport: "football",
      tournamentName: "Ligue 1 McDonald's",
      round: "28ème journée",
      venue: "Orange Vélodrome, Marseille",
      homeTeamName: "Olympique de Marseille",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/fr/4/43/Logo_Olympique_de_Marseille.svg",
      awayTeamName: "Olympique Lyonnais",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/fr/e/e2/Olympique_lyonnais_%28logo%29.svg",
      matchTime: hoursAhead(3),
      status: "UPCOMING",
      score: null,
      minute: null,
      broadcasters: {
        FR: ["DAZN 1", "DAZN France"],
        BE: ["DAZN Belgique"]
      },
      primaryBroadcaster: "DAZN 1"
    },
    {
      id: "today-foot-2",
      sport: "football",
      tournamentName: "Premier League",
      round: "Choc du weekend",
      venue: "Anfield, Liverpool",
      homeTeamName: "Liverpool FC",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
      awayTeamName: "Chelsea FC",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
      matchTime: hoursAhead(5),
      status: "UPCOMING",
      score: null,
      minute: null,
      broadcasters: {
        FR: ["Canal+ Premier League", "Canal+ Sport 360", "Canal+"],
        UK: ["Sky Sports Main Event"]
      },
      primaryBroadcaster: "Canal+ Sport 360"
    },
    {
      id: "today-foot-3",
      sport: "football",
      tournamentName: "LaLiga EA Sports",
      round: "31ème journée",
      venue: "Estadi Olímpic Lluís Companys, Barcelone",
      homeTeamName: "FC Barcelone",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
      awayTeamName: "Atlético de Madrid",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
      matchTime: hoursAhead(6),
      status: "UPCOMING",
      score: null,
      minute: null,
      broadcasters: {
        FR: ["beIN SPORTS 2", "beIN SPORTS 1"],
        ES: ["DAZN LaLiga"]
      },
      primaryBroadcaster: "beIN SPORTS 2"
    },

    // =========================================================================
    // BASKETBALL
    // =========================================================================
    {
      id: "live-basket-1",
      sport: "basketball",
      tournamentName: "NBA",
      round: "Saison Régulière",
      venue: "Crypto.com Arena, Los Angeles",
      homeTeamName: "Los Angeles Lakers",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg",
      awayTeamName: "Boston Celtics",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg",
      matchTime: minutesAgo(88),
      status: "LIVE",
      score: "98 - 94",
      minute: "Q4 03:12",
      period: "4ème quart-temps",
      broadcasters: {
        FR: ["beIN SPORTS 1", "beIN SPORTS Max 4"],
        US: ["ESPN", "NBA League Pass"]
      },
      primaryBroadcaster: "beIN SPORTS 1",
      lineups: DEMO_LINEUPS.basketball
    },
    {
      id: "live-basket-2",
      sport: "basketball",
      tournamentName: "EuroLeague",
      round: "Playoffs - Game 3",
      venue: "Salle Gaston Médecin, Monaco",
      homeTeamName: "AS Monaco Basket",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/fr/d/d7/Logo_AS_Monaco_Basket.svg",
      awayTeamName: "Panathinaikos BC",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/en/3/3a/Panathinaikos_BC_logo.svg",
      matchTime: minutesAgo(65),
      status: "LIVE",
      score: "76 - 71",
      minute: "Q4 01:45",
      period: "Fin de match intense",
      broadcasters: {
        FR: ["SKWEEK", "L'Équipe", "beIN SPORTS 3"]
      },
      primaryBroadcaster: "SKWEEK"
    },
    {
      id: "today-basket-1",
      sport: "basketball",
      tournamentName: "NBA",
      round: "Conférence Ouest",
      venue: "Chase Center, San Francisco",
      homeTeamName: "Golden State Warriors",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg",
      awayTeamName: "Milwaukee Bucks",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/en/4/4a/Milwaukee_Bucks_logo.svg",
      matchTime: hoursAhead(7),
      status: "UPCOMING",
      score: null,
      minute: null,
      broadcasters: {
        FR: ["beIN SPORTS 1", "beIN SPORTS Max 5"],
        US: ["TNT"]
      },
      primaryBroadcaster: "beIN SPORTS 1"
    },

    // =========================================================================
    // TENNIS
    // =========================================================================
    {
      id: "live-tennis-1",
      sport: "tennis",
      tournamentName: "Roland-Garros",
      round: "Finale Messieurs",
      venue: "Court Philippe-Chatrier, Paris",
      homeTeamName: "Carlos Alcaraz",
      homeTeamBadge: null,
      awayTeamName: "Jannik Sinner",
      awayTeamBadge: null,
      matchTime: minutesAgo(110),
      status: "LIVE",
      score: "6-3, 4-6, 5-4",
      minute: "Set 3 · 40-30",
      period: "3ème set décisif",
      broadcasters: {
        FR: ["France 2", "Eurosport 1", "France 3", "Prime Video"],
        ES: ["Eurosport España"]
      },
      primaryBroadcaster: "Eurosport 1",
      lineups: DEMO_LINEUPS.tennis
    },
    {
      id: "today-tennis-1",
      sport: "tennis",
      tournamentName: "Wimbledon",
      round: "Demi-Finale",
      venue: "Centre Court, Londres",
      homeTeamName: "Novak Djokovic",
      homeTeamBadge: null,
      awayTeamName: "Alexander Zverev",
      awayTeamBadge: null,
      matchTime: hoursAhead(4),
      status: "UPCOMING",
      score: null,
      minute: null,
      broadcasters: {
        FR: ["beIN SPORTS 1", "beIN SPORTS 2"],
        UK: ["BBC One"]
      },
      primaryBroadcaster: "beIN SPORTS 1"
    },

    // =========================================================================
    // FORMULE 1
    // =========================================================================
    {
      id: "live-f1-1",
      sport: "motorsport",
      tournamentName: "Formule 1 - Grand Prix de Monaco",
      round: "Course Principale (78 Tours)",
      venue: "Circuit de Monaco, Monte-Carlo",
      homeTeamName: "Max Verstappen (Red Bull)",
      homeTeamBadge: null,
      awayTeamName: "Charles Leclerc (Ferrari)",
      awayTeamBadge: null,
      matchTime: minutesAgo(58),
      status: "LIVE",
      score: "P1 / P2 (+1.4s)",
      minute: "Tour 54 / 78",
      period: "Secteur 3 en cours",
      broadcasters: {
        FR: ["Canal+", "Canal+ Sport"],
        UK: ["Sky Sports F1"],
        BE: ["Tipik"]
      },
      primaryBroadcaster: "Canal+",
      lineups: DEMO_LINEUPS.motorsport
    },
    {
      id: "today-f1-1",
      sport: "motorsport",
      tournamentName: "Formule 1 - GP de Grande-Bretagne",
      round: "Séance de Qualifications",
      venue: "Silverstone Circuit",
      homeTeamName: "Lando Norris (McLaren)",
      homeTeamBadge: null,
      awayTeamName: "Lewis Hamilton (Mercedes)",
      awayTeamBadge: null,
      matchTime: hoursAhead(5),
      status: "UPCOMING",
      score: null,
      minute: null,
      broadcasters: {
        FR: ["Canal+ Sport", "Canal+"],
        UK: ["Sky Sports F1"]
      },
      primaryBroadcaster: "Canal+ Sport"
    },

    // =========================================================================
    // RUGBY
    // =========================================================================
    {
      id: "live-rugby-1",
      sport: "rugby",
      tournamentName: "Top 14",
      round: "Choc de la 24ème journée",
      venue: "Stade Ernest-Wallon, Toulouse",
      homeTeamName: "Stade Toulousain",
      homeTeamBadge: "https://upload.wikimedia.org/wikipedia/fr/5/52/Logo_Stade_Toulousain.svg",
      awayTeamName: "Stade Rochelais",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/fr/6/60/Logo_Stade_Rochelais_2016.svg",
      matchTime: minutesAgo(68),
      status: "LIVE",
      score: "24 - 19",
      minute: "68'",
      period: "2ème mi-temps (Essai Dupont)",
      broadcasters: {
        FR: ["Canal+", "Canal+ Sport"]
      },
      primaryBroadcaster: "Canal+",
      lineups: DEMO_LINEUPS.rugby
    },
    {
      id: "today-rugby-1",
      sport: "rugby",
      tournamentName: "Investec Champions Cup",
      round: "Demi-Finale",
      venue: "Aviva Stadium, Dublin",
      homeTeamName: "Leinster Rugby",
      homeTeamBadge: null,
      awayTeamName: "Union Bordeaux Bègles",
      awayTeamBadge: "https://upload.wikimedia.org/wikipedia/fr/a/a2/Logo_Union_Bordeaux_B%C3%A8gles.svg",
      matchTime: hoursAhead(4),
      status: "UPCOMING",
      score: null,
      minute: null,
      broadcasters: {
        FR: ["beIN SPORTS 2", "France 2"],
        UK: ["TNT Sports 1"]
      },
      primaryBroadcaster: "beIN SPORTS 2"
    },

    // =========================================================================
    // COMBAT / UFC
    // =========================================================================
    {
      id: "live-combat-1",
      sport: "combat",
      tournamentName: "UFC 314",
      round: "Titre Mondial Lightweight (5 Rounds)",
      venue: "T-Mobile Arena, Las Vegas",
      homeTeamName: "Islam Makhachev",
      homeTeamBadge: null,
      awayTeamName: "Arman Tsarukyan",
      awayTeamBadge: null,
      matchTime: minutesAgo(24),
      status: "LIVE",
      score: "R3 · 02:45",
      minute: "Round 3",
      period: "Combat au sol intense",
      broadcasters: {
        FR: ["RMC Sport 2", "RMC Sport 1", "UFC Fight Pass"],
        US: ["ESPN+ PPV"]
      },
      primaryBroadcaster: "RMC Sport 2",
      lineups: DEMO_LINEUPS.combat
    },
    {
      id: "today-combat-1",
      sport: "combat",
      tournamentName: "PFL Europe Paris",
      round: "Main Event Welterweight",
      venue: "Accor Arena, Paris-Bercy",
      homeTeamName: "Cédric Doumbé",
      homeTeamBadge: null,
      awayTeamName: "Baysangur Chamsoudinov",
      awayTeamBadge: null,
      matchTime: hoursAhead(6),
      status: "UPCOMING",
      score: null,
      minute: null,
      broadcasters: {
        FR: ["DAZN 1", "DAZN France"],
        US: ["ESPN+"]
      },
      primaryBroadcaster: "DAZN 1"
    }
  ];
}

/**
 * Normalizes a raw Supabase `megatv_sports_guide` row into our frontend `SportMatch` format.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSupabaseMatchRow(row: any): SportMatch {
  const teamsRaw = (row.teams as string) || "Équipe 1 vs Équipe 2";
  let home = "Équipe 1";
  let away = "Équipe 2";

  if (teamsRaw.includes(" vs ")) {
    const parts = teamsRaw.split(" vs ");
    home = parts[0]?.trim() || home;
    away = parts[1]?.trim() || away;
  } else if (teamsRaw.includes(" - ")) {
    const parts = teamsRaw.split(" - ");
    home = parts[0]?.trim() || home;
    away = parts[1]?.trim() || away;
  } else {
    home = teamsRaw;
  }

  // Detect sport from tournament name or teams
  const tName = (row.tournament_name as string) || "";
  let sport: SportDiscipline = "football";
  const lowerT = tName.toLowerCase();
  const lowerTeams = teamsRaw.toLowerCase();

  if (lowerT.includes("basket") || lowerT.includes("nba") || lowerT.includes("euroleague") || lowerTeams.includes("basket")) {
    sport = "basketball";
  } else if (lowerT.includes("tennis") || lowerT.includes("atp") || lowerT.includes("wta") || lowerT.includes("roland") || lowerTeams.includes("tennis")) {
    sport = "tennis";
  } else if (lowerT.includes("f1") || lowerT.includes("formule") || lowerT.includes("formula") || lowerT.includes("grand prix") || lowerT.includes("moto")) {
    sport = "motorsport";
  } else if (lowerT.includes("rugby") || lowerT.includes("top 14") || lowerT.includes("champions cup")) {
    sport = "rugby";
  } else if (lowerT.includes("ufc") || lowerT.includes("mma") || lowerT.includes("boxe") || lowerT.includes("pfl") || lowerT.includes("combat")) {
    sport = "combat";
  }

  const rawStatus = (row.status as string) || "UPCOMING";
  const isLive = rawStatus.toUpperCase() === "LIVE";
  const status: "LIVE" | "UPCOMING" | "FINISHED" = isLive ? "LIVE" : rawStatus.toUpperCase() === "FINISHED" ? "FINISHED" : "UPCOMING";

  const rawBroadcasters = (row.broadcasters as Record<string, string[]>) || {};
  const frList = rawBroadcasters.FR || rawBroadcasters.fr || [];
  const primaryBroadcaster = frList[0] || (Object.values(rawBroadcasters)[0]?.[0] ?? null);

  return {
    id: row.id || `match-${Math.random().toString(36).slice(2)}`,
    sport,
    tournamentName: tName || "Compétition Sportive",
    homeTeamName: home,
    homeTeamBadge: row.home_team_badge || null,
    awayTeamName: away,
    awayTeamBadge: row.away_team_badge || null,
    matchTime: row.match_time || new Date().toISOString(),
    status,
    score: row.score || (isLive ? "1 - 0" : null),
    minute: isLive ? "60'" : null,
    broadcasters: rawBroadcasters,
    primaryBroadcaster,
    sourceUrl: row.source_url || null
  };
}
