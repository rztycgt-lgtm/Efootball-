import { Player, PlayerPosition, CardRarity, Squad, PlayStyleType, FormationType, MatchCommentaryEvent } from "./types";

// Dynamic soccer players list
export const MASTER_PLAYERS_POOL: Player[] = [
  // Epics / Legends
  {
    id: "legend-messi",
    name: "L. Messi",
    rating: 98,
    position: "RWF",
    nationality: "Argentine",
    club: "Inter Miami (Legend)",
    rarity: "Epic",
    stats: { pac: 91, sho: 96, pas: 98, dri: 99, def: 42, phy: 75 },
    level: 1,
    maxLevel: 25,
    color: "from-amber-400 via-yellow-500 to-amber-600",
    price: 150000,
    contractRemaining: 10
  },
  {
    id: "legend-maradona",
    name: "D. Maradona",
    rating: 99,
    position: "AMF",
    nationality: "Argentine",
    club: "Napoli (Legend)",
    rarity: "Legend",
    stats: { pac: 92, sho: 94, pas: 96, dri: 99, def: 38, phy: 78 },
    level: 1,
    maxLevel: 30,
    color: "from-amber-300 via-rose-500 to-yellow-600",
    price: 250000,
    contractRemaining: 10
  },
  {
    id: "legend-ronaldinho",
    name: "Ronaldinho",
    rating: 97,
    position: "LWF",
    nationality: "Brésil",
    club: "Barcelona (Legend)",
    rarity: "Epic",
    stats: { pac: 94, sho: 91, pas: 93, dri: 99, def: 39, phy: 80 },
    level: 1,
    maxLevel: 25,
    color: "from-purple-600 via-pink-600 to-amber-500",
    price: 180000,
    contractRemaining: 10
  },
  {
    id: "legend-zidane",
    name: "Z. Zidane",
    rating: 97,
    position: "AMF",
    nationality: "France",
    club: "Real Madrid (Legend)",
    rarity: "Legend",
    stats: { pac: 83, sho: 89, pas: 97, dri: 95, def: 65, phy: 86 },
    level: 1,
    maxLevel: 25,
    color: "from-sky-400 via-blue-500 to-indigo-600",
    price: 200000,
    contractRemaining: 10
  },
  {
    id: "legend-beckham",
    name: "D. Beckham",
    rating: 95,
    position: "CMF",
    nationality: "Angleterre",
    club: "Manchester Utd (Legend)",
    rarity: "Epic",
    stats: { pac: 80, sho: 88, pas: 99, dri: 88, def: 72, phy: 80 },
    level: 1,
    maxLevel: 20,
    color: "from-emerald-400 via-teal-500 to-cyan-600",
    price: 120000,
    contractRemaining: 10
  },

  // Trending / Modern Stars
  {
    id: "star-mbappe",
    name: "K. Mbappé",
    rating: 96,
    position: "CF",
    nationality: "France",
    club: "Real Madrid",
    rarity: "Trending",
    stats: { pac: 99, sho: 94, pas: 83, dri: 93, def: 36, phy: 82 },
    level: 1,
    maxLevel: 18,
    color: "from-violet-500 to-indigo-700",
    price: 90000,
    contractRemaining: 10
  },
  {
    id: "star-haaland",
    name: "E. Haaland",
    rating: 95,
    position: "CF",
    nationality: "Norvège",
    club: "Manchester City",
    rarity: "Trending",
    stats: { pac: 94, sho: 96, pas: 72, dri: 81, def: 45, phy: 93 },
    level: 1,
    maxLevel: 15,
    color: "from-teal-500 to-cyan-700",
    price: 85000,
    contractRemaining: 10
  },
  {
    id: "star-debruyne",
    name: "K. De Bruyne",
    rating: 94,
    position: "AMF",
    nationality: "Belgique",
    club: "Manchester City",
    rarity: "Trending",
    stats: { pac: 76, sho: 88, pas: 97, dri: 89, def: 64, phy: 78 },
    level: 1,
    maxLevel: 15,
    color: "from-blue-500 to-indigo-600",
    price: 80000,
    contractRemaining: 10
  },
  {
    id: "star-bellingham",
    name: "J. Bellingham",
    rating: 93,
    position: "CMF",
    nationality: "Angleterre",
    club: "Real Madrid",
    rarity: "Trending",
    stats: { pac: 84, sho: 86, pas: 88, dri: 90, def: 83, phy: 88 },
    level: 1,
    maxLevel: 20,
    color: "from-amber-500 to-yellow-600",
    price: 75000,
    contractRemaining: 10
  },
  {
    id: "star-vandijk",
    name: "V. van Dijk",
    rating: 93,
    position: "CB",
    nationality: "Pays-Bas",
    club: "Liverpool",
    rarity: "Trending",
    stats: { pac: 81, sho: 60, pas: 75, dri: 72, def: 95, phy: 93 },
    level: 1,
    maxLevel: 15,
    color: "from-red-500 to-orange-600",
    price: 70000,
    contractRemaining: 10
  },

  // Standard Players
  {
    id: "std-saka",
    name: "B. Saka",
    rating: 89,
    position: "RWF",
    nationality: "Angleterre",
    club: "Arsenal",
    rarity: "Standard",
    stats: { pac: 88, sho: 84, pas: 85, dri: 89, def: 55, phy: 75 },
    level: 1,
    maxLevel: 20,
    color: "from-slate-700 to-slate-900",
    price: 45000,
    contractRemaining: 10
  },
  {
    id: "std-pedri",
    name: "Pedri",
    rating: 88,
    position: "CMF",
    nationality: "Espagne",
    club: "Barcelona",
    rarity: "Standard",
    stats: { pac: 80, sho: 77, pas: 91, dri: 90, def: 68, phy: 70 },
    level: 1,
    maxLevel: 25,
    color: "from-slate-700 to-slate-900",
    price: 40000,
    contractRemaining: 10
  },
  {
    id: "std-rodri",
    name: "Rodri",
    rating: 91,
    position: "DMF",
    nationality: "Espagne",
    club: "Manchester City",
    rarity: "Standard",
    stats: { pac: 72, sho: 78, pas: 86, dri: 82, def: 91, phy: 89 },
    level: 1,
    maxLevel: 15,
    color: "from-slate-700 to-slate-900",
    price: 55000,
    contractRemaining: 10
  },
  {
    id: "std-davies",
    name: "A. Davies",
    rating: 86,
    position: "LB",
    nationality: "Canada",
    club: "Bayern München",
    rarity: "Standard",
    stats: { pac: 96, sho: 68, pas: 77, dri: 85, def: 76, phy: 78 },
    level: 1,
    maxLevel: 22,
    color: "from-slate-700 to-slate-900",
    price: 32000,
    contractRemaining: 10
  },
  {
    id: "std-hakimi",
    name: "A. Hakimi",
    rating: 87,
    position: "RB",
    nationality: "Maroc",
    club: "PSG",
    rarity: "Standard",
    stats: { pac: 94, sho: 75, pas: 80, dri: 83, def: 78, phy: 80 },
    level: 1,
    maxLevel: 20,
    color: "from-slate-700 to-slate-900",
    price: 35000,
    contractRemaining: 10
  },
  {
    id: "std-saliba",
    name: "W. Saliba",
    rating: 89,
    position: "CB",
    nationality: "France",
    club: "Arsenal",
    rarity: "Standard",
    stats: { pac: 83, sho: 45, pas: 72, dri: 74, def: 91, phy: 86 },
    level: 1,
    maxLevel: 22,
    color: "from-slate-700 to-slate-900",
    price: 48000,
    contractRemaining: 10
  },
  {
    id: "std-courtois",
    name: "T. Courtois",
    rating: 91,
    position: "GK",
    nationality: "Belgique",
    club: "Real Madrid",
    rarity: "Standard",
    stats: { pac: 85, sho: 89, pas: 74, dri: 88, def: 92, phy: 90 },
    level: 1,
    maxLevel: 15,
    color: "from-slate-700 to-slate-900",
    price: 50000,
    contractRemaining: 10
  },

  // Lower / Starter standard players for progression
  {
    id: "std-giroud",
    name: "O. Giroud",
    rating: 82,
    position: "CF",
    nationality: "France",
    club: "AC Milan",
    rarity: "Standard",
    stats: { pac: 68, sho: 83, pas: 70, dri: 72, def: 42, phy: 88 },
    level: 1,
    maxLevel: 12,
    color: "from-slate-700 to-slate-900",
    price: 15000,
    contractRemaining: 10
  },
  {
    id: "std-kante",
    name: "N. Kanté",
    rating: 84,
    position: "DMF",
    nationality: "France",
    club: "Al Ittihad",
    rarity: "Standard",
    stats: { pac: 78, sho: 66, pas: 75, dri: 81, def: 88, phy: 83 },
    level: 1,
    maxLevel: 15,
    color: "from-slate-700 to-slate-900",
    price: 22000,
    contractRemaining: 10
  },
  {
    id: "std-griezmann",
    name: "A. Griezmann",
    rating: 86,
    position: "AMF",
    nationality: "France",
    club: "Atlético Madrid",
    rarity: "Standard",
    stats: { pac: 80, sho: 85, pas: 87, dri: 88, def: 58, phy: 72 },
    level: 1,
    maxLevel: 15,
    color: "from-slate-700 to-slate-900",
    price: 30000,
    contractRemaining: 10
  },
  {
    id: "std-donnarumma",
    name: "G. Donnarumma",
    rating: 86,
    position: "GK",
    nationality: "Italie",
    club: "PSG",
    rarity: "Standard",
    stats: { pac: 82, sho: 84, pas: 70, dri: 83, def: 87, phy: 88 },
    level: 1,
    maxLevel: 18,
    color: "from-slate-700 to-slate-900",
    price: 28000,
    contractRemaining: 10
  },
  {
    id: "std-muller",
    name: "T. Müller",
    rating: 83,
    position: "AMF",
    nationality: "Allemagne",
    club: "Bayern München",
    rarity: "Standard",
    stats: { pac: 69, sho: 82, pas: 83, dri: 78, def: 55, phy: 73 },
    level: 1,
    maxLevel: 15,
    color: "from-slate-700 to-slate-900",
    price: 18000,
    contractRemaining: 10
  }
];

// Initial starter squad for new managers
export function generateStarterSquad(): Squad {
  // Let's create an initial 4-3-3 squad with decent standard players and some empty slots
  const players = MASTER_PLAYERS_POOL;
  
  return {
    starters: {
      GK: players.find((p) => p.id === "std-donnarumma") || null,
      CB: players.find((p) => p.id === "std-saliba") || null,
      LB: players.find((p) => p.id === "std-davies") || null,
      RB: players.find((p) => p.id === "std-hakimi") || null,
      DMF: players.find((p) => p.id === "std-kante") || null,
      CMF: players.find((p) => p.id === "std-pedri") || null,
      AMF: players.find((p) => p.id === "std-muller") || null,
      LWF: null, // Let them scout or draw for LWF/RWF
      RWF: null,
      CF: players.find((p) => p.id === "std-giroud") || null,
    },
    bench: [
      players.find((p) => p.id === "std-griezmann")!,
    ].filter(Boolean),
    formation: "4-3-3",
    playStyle: "Possession"
  };
}

// Compute ratings & stats for active squad
export function calculateSquadMetrics(squad: Squad) {
  let totalRating = 0;
  let activeStartersCount = 0;
  
  const positions: PlayerPosition[] = ["GK", "CB", "LB", "RB", "DMF", "CMF", "AMF", "LWF", "RWF", "CF"];
  
  positions.forEach((pos) => {
    const player = squad.starters[pos];
    if (player) {
      totalRating += player.rating;
      activeStartersCount++;
    }
  });

  // Calculate team chemistry based on playStyle synergy + starter slots occupied
  const filledSlotsBonus = (activeStartersCount / 10) * 70; // up to 70 chemistry
  
  // High ratings give small extra chemistry up to 30 points
  const avgRating = activeStartersCount > 0 ? (totalRating / activeStartersCount) : 50;
  const ratingBonus = Math.min(30, Math.max(0, (avgRating - 70) * 1.5));
  
  const chemistry = Math.round(Math.min(100, filledSlotsBonus + ratingBonus));
  const collectiveStrength = Math.round(activeStartersCount > 0 ? (totalRating / activeStartersCount) : 0);

  return {
    collectiveStrength,
    chemistry,
    startersCount: activeStartersCount
  };
}

// List of standard opponents to play matches with
export const OPPONENTS: { name: string; rating: number; logo: string }[] = [
  { name: "Paris Soccer Club", rating: 83, logo: "🗼" },
  { name: "Madrid Blancos", rating: 92, logo: "👑" },
  { name: "Manchester Sky Blue", rating: 94, logo: "🏙️" },
  { name: "Bayern Eagles", rating: 89, logo: "🦅" },
  { name: "Milano Rossoneri", rating: 84, logo: "🔴" },
  { name: "London Gunners", rating: 88, logo: "🔫" },
  { name: "Barcelona Azulgrana", rating: 90, logo: "🏟️" }
];

// Match Commentary simulator
export function generateSimulatedMatch(
  userTeamStrength: number,
  userTeamChemistry: number,
  opponentName: string,
  opponentStrength: number
): MatchCommentaryEvent[] {
  const events: MatchCommentaryEvent[] = [];
  
  // Game probabilities based on rating gap
  const gap = (userTeamStrength + userTeamChemistry / 10) - opponentStrength;
  const winProbability = 0.4 + (gap / 100); // base 40% adjusted by gap
  
  let userScore = 0;
  let opponentScore = 0;
  
  // Kick off event
  events.push({
    minute: 0,
    type: "KICKOFF",
    team: "HOME",
    text: `C'est le coup d'envoi ici au stade ! Votre Dream Team affronte ${opponentName}.`
  });

  // Generate 6 key match events at realistic minutes
  const keyMinutes = [12, 28, 41, 58, 73, 86];

  keyMinutes.forEach((min) => {
    const isHomeAttack = Math.random() < winProbability;
    const isGoal = Math.random() < 0.45; // 45% chance an attack yields a goal

    if (isHomeAttack) {
      if (isGoal) {
        userScore++;
        const scorers = ["K. Mbappé", "L. Messi", "E. Haaland", "Ronaldinho", "Z. Zidane", "J. Bellingham", "O. Giroud"];
        const scorer = scorers[Math.floor(Math.random() * scorers.length)];
        
        const textOptions = [
          `BUT !!! Magnifique frappe enroulée de ${scorer} qui trouve la lucarne droite !`,
          `BUT POUR VOTRE EQUIPE ! ${scorer} hérite du ballon à l'entrée de la surface et trompe le gardien d'un tir puissant !`,
          `INCROYABLE ! ${scorer} élimine deux défenseurs d'un double contact sublime avant de marquer !`
        ];
        events.push({
          minute: min,
          type: "GOAL",
          team: "HOME",
          playerName: scorer,
          text: textOptions[Math.floor(Math.random() * textOptions.length)]
        });
      } else {
        // Safe or Shoot wide
        const shotActions = [
          "Tentative lointaine qui rase le montant gauche de l'adversaire.",
          "Superbe parade du gardien adverse sur une tête plongeante !",
          "L'attaquant s'infiltre mais pousse trop son ballon, sortie de but."
        ];
        events.push({
          minute: min,
          type: "SAVE",
          team: "HOME",
          text: shotActions[Math.floor(Math.random() * shotActions.length)]
        });
      }
    } else {
      // Away Attack
      if (isGoal) {
        opponentScore++;
        const textOptions = [
          `But de ${opponentName} ! Erreur de marquage de notre défense sur ce corner bien tiré.`,
          `But encaissé... L'attaquant adverse dribble notre gardien et pousse le ballon au fond.`,
          `But pour l'adversaire ! Une contre-attaque éclair qui prend toute notre équipe de court.`
        ];
        events.push({
          minute: min,
          type: "GOAL",
          team: "AWAY",
          text: textOptions[Math.floor(Math.random() * textOptions.length)]
        });
      } else {
        const defensiveActions = [
          "Superbe tacle glissé de notre défenseur qui écarte le danger !",
          "Arrêt décisif de notre gardien qui s'impose dans les airs !",
          "Le tir adverse s'envole directement dans les tribunes."
        ];
        events.push({
          minute: min,
          type: "SAVE",
          team: "AWAY",
          text: defensiveActions[Math.floor(Math.random() * defensiveActions.length)]
        });
      }
    }
  });

  // Full time whistle
  events.push({
    minute: 90,
    type: "FULLTIME",
    team: "HOME",
    text: `C'est fini ! Arbitre siffle la fin du match. Score Final : Vous ${userScore} - ${opponentScore} ${opponentName}.`
  });

  return events;
}

// Opening packs generators
export interface PackConfig {
  name: string;
  cost: number;
  currency: "gp" | "coins";
  description: string;
  epicRate: number; // probability of Epic/Legend card (e.g. 0.15)
  trendingRate: number; // probability of Trending card (e.g. 0.35)
}

export const DRAW_PACKS: PackConfig[] = [
  {
    name: "Standard scout",
    cost: 15000,
    currency: "gp",
    description: "Recrutez de solides joueurs titulaires ou remplaçants du monde entier.",
    epicRate: 0.02,
    trendingRate: 0.15
  },
  {
    name: "Sélection Vedettes",
    cost: 100,
    currency: "coins",
    description: "Une chance d'obtenir des superstars en pleine forme (Trending / Epic).",
    epicRate: 0.10,
    trendingRate: 0.50
  },
  {
    name: "Légendes Épiques",
    cost: 250,
    currency: "coins",
    description: "Garanti d'avoir d'anciennes légendes épiques de légende (Ronaldinho, Zidane, Maradona).",
    epicRate: 0.35,
    trendingRate: 0.35
  }
];

// Open Pack action logic
export function openPlayerPack(pack: PackConfig): Player {
  const rand = Math.random();
  let selectedRarity: CardRarity = "Standard";

  if (rand < pack.epicRate) {
    // Pick standard, epic, or legend
    const roll = Math.random();
    selectedRarity = roll < 0.4 ? "Legend" : "Epic";
  } else if (rand < pack.epicRate + pack.trendingRate) {
    selectedRarity = "Trending";
  } else {
    selectedRarity = "Standard";
  }

  // Filter pool by chosen rarity
  let candidates = MASTER_PLAYERS_POOL.filter((p) => p.rarity === selectedRarity);
  if (candidates.length === 0) {
    candidates = MASTER_PLAYERS_POOL.filter((p) => p.rarity === "Standard");
  }

  // Pick random candidate
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  
  // Clone to avoid mutation and generate a distinct ID instance
  return {
    ...picked,
    id: picked.id + "-" + Math.random().toString(36).substring(2, 7)
  };
}
