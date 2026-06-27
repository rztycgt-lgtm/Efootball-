export type PlayerPosition = "GK" | "CB" | "LB" | "RB" | "DMF" | "CMF" | "AMF" | "LWF" | "RWF" | "CF";

export type CardRarity = "Standard" | "Trending" | "Epic" | "Legend";

export interface PlayerStats {
  pac: number; // Vitesse (Pace)
  sho: number; // Tir (Shooting)
  pas: number; // Passe (Passing)
  dri: number; // Dribble (Dribbling)
  def: number; // Défense (Defending)
  phy: number; // Physique (Physical)
}

export interface Player {
  id: string;
  name: string;
  rating: number; // Overall rating (e.g., 75 - 99)
  position: PlayerPosition;
  nationality: string;
  club: string;
  rarity: CardRarity;
  stats: PlayerStats;
  level: number;
  maxLevel: number;
  color: string; // Theme color representation for card background
  price: number; // GP price to buy
  contractRemaining: number; // in matches
}

export type FormationType = "4-3-3" | "4-4-2" | "3-5-2" | "4-2-3-1";

export type PlayStyleType = "Possession" | "Contre-Rapide" | "Sur les Ailes" | "Long Ballon";

export interface Squad {
  starters: Record<PlayerPosition, Player | null>;
  bench: Player[];
  formation: FormationType;
  playStyle: PlayStyleType;
}

export interface MatchCommentaryEvent {
  minute: number;
  type: "GOAL" | "SHOOT" | "FOUL" | "SAVE" | "CARD" | "CORNER" | "KICKOFF" | "FULLTIME";
  team: "HOME" | "AWAY";
  playerName?: string;
  text: string;
}

export interface OpponentTeam {
  name: string;
  rating: number;
  logo: string;
}

export interface UserClubState {
  name: string;
  gp: number; // standard gold points
  coins: number; // myclub premium coins
  squad: Squad;
  myPlayers: Player[];
}
