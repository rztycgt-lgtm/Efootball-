import React, { useState, useEffect } from "react";
import MobileFrame from "./components/MobileFrame";
import PlayerCard from "./components/PlayerCard";
import TacticalPitch from "./components/TacticalPitch";
import PacksShop from "./components/PacksShop";
import MatchSimulation from "./components/MatchSimulation";
import TikTokStudio from "./components/TikTokStudio";
import { Player, Squad, PlayerPosition, FormationType, PlayStyleType, UserClubState } from "./types";
import { calculateSquadMetrics, generateStarterSquad, MASTER_PLAYERS_POOL } from "./utils";
import { 
  Sparkles, 
  RotateCcw, 
  Sun, 
  Moon, 
  ShieldAlert, 
  ChevronRight, 
  Trophy, 
  Coins, 
  Activity, 
  Layout, 
  ShoppingBag, 
  Gamepad2, 
  BrainCircuit,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  UserPlus,
  RefreshCw,
  X,
  Video
} from "lucide-react";

export default function App() {
  // Navigation Tabs: "tactics" | "shop" | "matches" | "coach" | "tiktok"
  const [activeTab, setActiveTab] = useState<"tactics" | "shop" | "matches" | "coach" | "tiktok">("tactics");
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Club finances and assets state
  const [gp, setGp] = useState<number>(80000); // gold points for standard draws
  const [coins, setCoins] = useState<number>(350); // myclub coins for premium draws
  const [myPlayers, setMyPlayers] = useState<Player[]>([]);
  const [squad, setSquad] = useState<Squad>(generateStarterSquad());

  // Interactive Swap/Fill Starter position state
  const [selectingPosition, setSelectingPosition] = useState<PlayerPosition | null>(null);

  // AI Tactical advisory state
  const [coachAdvice, setCoachAdvice] = useState<{
    coachName: string;
    coachAvatarEmoji: string;
    tacticalRating: number;
    analysisParagraphs: string[];
    recommendedTarget: { playerName: string; reason: string };
  } | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);

  // Success notifications toast
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sync dark mode on mount & Load initial local storage data
  useEffect(() => {
    // Sync dark mode theme class
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Load state from local storage if existing
    const cachedClub = localStorage.getItem("efootball_club_state");
    if (cachedClub) {
      try {
        const parsed = JSON.parse(cachedClub);
        if (parsed.gp !== undefined) setGp(parsed.gp);
        if (parsed.coins !== undefined) setCoins(parsed.coins);
        if (parsed.myPlayers) setMyPlayers(parsed.myPlayers);
        if (parsed.squad) setSquad(parsed.squad);
      } catch (e) {
        initializeFirstTimeState();
      }
    } else {
      initializeFirstTimeState();
    }
  }, []);

  // Save current state helper
  const saveClubState = (updatedGp: number, updatedCoins: number, updatedPlayers: Player[], updatedSquad: Squad) => {
    setGp(updatedGp);
    setCoins(updatedCoins);
    setMyPlayers(updatedPlayers);
    setSquad(updatedSquad);

    const raw = {
      gp: updatedGp,
      coins: updatedCoins,
      myPlayers: updatedPlayers,
      squad: updatedSquad
    };
    localStorage.setItem("efootball_club_state", JSON.stringify(raw));
  };

  const initializeFirstTimeState = () => {
    // Set up default standard list of players with starter pack
    const starterSquad = generateStarterSquad();
    
    // Add starter squad members to 'myPlayers' roster so they can swap them around
    const initialRoster: Player[] = [];
    Object.keys(starterSquad.starters).forEach((key) => {
      const p = starterSquad.starters[key as PlayerPosition];
      if (p) initialRoster.push(p);
    });
    starterSquad.bench.forEach((p) => initialRoster.push(p));

    // Also give them some standard recruits to start trading
    const additionalStd = MASTER_PLAYERS_POOL.filter(
      (p) => p.rarity === "Standard" && !initialRoster.some((ir) => ir.id === p.id)
    );
    initialRoster.push(...additionalStd.slice(0, 3));

    saveClubState(80000, 350, initialRoster, starterSquad);
  };

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Reset progress entirely back to standard starter pack
  const handleResetClub = () => {
    if (window.confirm("Voulez-vous réinitialiser votre club, votre effectif et vos budgets ?")) {
      initializeFirstTimeState();
      setFeedbackMsg("Votre club a été réinitialisé ! 🔄");
      setCoachAdvice(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Funds Deduction wrapper
  const handleDeductFunds = (cost: number, currency: "gp" | "coins"): boolean => {
    if (currency === "gp") {
      if (gp < cost) return false;
      const nextGp = gp - cost;
      saveClubState(nextGp, coins, myPlayers, squad);
      return true;
    } else {
      if (coins < cost) return false;
      const nextCoins = coins - cost;
      saveClubState(gp, nextCoins, myPlayers, squad);
      return true;
    }
  };

  // Signed player acquisition hook
  const handlePlayerAcquired = (player: Player) => {
    const nextRoster = [player, ...myPlayers];
    saveClubState(gp, coins, nextRoster, squad);
    triggerFeedback(`Superbe ! ${player.name} (${player.rating}) a signé dans votre club ! ✍️`);
  };

  // Match rewards hook
  const handleMatchRewardGranted = (earnedGp: number, earnedCoins: number) => {
    const nextGp = gp + earnedGp;
    const nextCoins = coins + earnedCoins;
    saveClubState(nextGp, nextCoins, myPlayers, squad);
    triggerFeedback(`+${earnedGp.toLocaleString()} GP & +${earnedCoins} Coins gagnés au match ! 💰`);
  };

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Swap / Fill starter position
  const handleSelectStarterForPosition = (player: Player | null) => {
    if (!selectingPosition) return;

    // 1. Remove this player if they are currently assigned to any other starter position (to avoid duplicate cards on the pitch)
    const nextStarters = { ...squad.starters };
    if (player) {
      Object.keys(nextStarters).forEach((posKey) => {
        const currentP = nextStarters[posKey as PlayerPosition];
        if (currentP && currentP.id === player.id) {
          nextStarters[posKey as PlayerPosition] = null;
        }
      });
    }

    // 2. Set chosen player to target position
    nextStarters[selectingPosition] = player;

    const nextSquad = {
      ...squad,
      starters: nextStarters
    };

    saveClubState(gp, coins, myPlayers, nextSquad);
    setSelectingPosition(null);
    triggerFeedback(player ? `${player.name} est maintenant titulaire au poste ${selectingPosition} !` : `Poste ${selectingPosition} libéré.`);
  };

  // Change Formation hook
  const handleChangeFormation = (form: FormationType) => {
    const nextSquad = {
      ...squad,
      formation: form
    };
    saveClubState(gp, coins, myPlayers, nextSquad);
    triggerFeedback(`Tactique mise à jour: Formation ${form} active ! 📋`);
  };

  // Change Play Style hook
  const handleChangePlayStyle = (style: PlayStyleType) => {
    const nextSquad = {
      ...squad,
      playStyle: style
    };
    saveClubState(gp, coins, myPlayers, nextSquad);
    triggerFeedback(`Style collectif défini sur : ${style} ! 🎯`);
  };

  // Call Gemini Advisor inside `/api/coach-advice` route
  const handleFetchCoachAdvice = async () => {
    setIsCoachLoading(true);
    setCoachAdvice(null);
    try {
      const response = await fetch("/api/coach-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          squad,
          myPlayersCount: myPlayers.length,
          gp,
          coins
        })
      });

      if (!response.ok) {
        throw new Error("Coach API fail");
      }

      const result = await response.json();
      setCoachAdvice(result);
    } catch (err) {
      console.error(err);
      triggerFeedback("Erreur lors de la consultation de l'IA. Veuillez réessayer ! ⚠️");
    } finally {
      setIsCoachLoading(false);
    }
  };

  // Get active team rating metrics
  const { collectiveStrength, chemistry, startersCount } = calculateSquadMetrics(squad);

  // Candidates for swap slot (filtered by matching preferred position or general availability)
  const availableRosterForSelection = myPlayers.filter((p) => {
    // Ensure they aren't currently in the active pitch spot we are editing
    const currentOnSpot = squad.starters[selectingPosition || "GK"];
    return !currentOnSpot || currentOnSpot.id !== p.id;
  });

  return (
    <MobileFrame>
      {/* Top Banner Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-slate-900 shadow-md shadow-yellow-500/20">
            <span className="font-black text-xs font-mono">eF</span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
              Pocket Manager
            </h1>
            <span className="text-[10px] text-yellow-500 dark:text-yellow-400 font-extrabold tracking-widest uppercase">
              Dream Squad
            </span>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          {/* Reset button */}
          <button
            id="reset-club-btn"
            onClick={handleResetClub}
            title="Réinitialiser l'effectif"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Theme switcher */}
          <button 
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            title="Changer de thème"
            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main interactive tabs scroll zone */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40 pb-20 relative">
        
        {/* Universal toast alerts */}
        {feedbackMsg && (
          <div className="absolute top-3 left-4 right-4 z-30 animate-bounce">
            <div className="p-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/35 backdrop-blur-md text-xs font-bold text-yellow-600 dark:text-yellow-400 text-center shadow-lg">
              {feedbackMsg}
            </div>
          </div>
        )}

        {/* TAB 1: TACTICS & TEAM BUILDER */}
        {activeTab === "tactics" && (
          <div className="space-y-4 animate-fade-in">
            {/* Squad Stats Bar */}
            <div className="px-4 pt-3.5 grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2.5 rounded-2xl shadow-xs">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Force Team</span>
                <p className="text-base font-black font-mono text-slate-800 dark:text-slate-100">{collectiveStrength}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2.5 rounded-2xl shadow-xs">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Collectif</span>
                <p className="text-base font-black font-mono text-yellow-500">{chemistry}%</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2.5 rounded-2xl shadow-xs">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Titulaires</span>
                <p className="text-base font-black font-mono text-slate-800 dark:text-slate-100">{startersCount}/10</p>
              </div>
            </div>

            {/* Tactical pitch layout view */}
            <TacticalPitch squad={squad} onPositionClick={setSelectingPosition} />

            {/* Formations & Tactics Selector card */}
            <div className="px-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs space-y-4">
                {/* Formation Picker */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block mb-2">
                    Schéma Tactique (Formation)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {(["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"] as FormationType[]).map((form) => (
                      <button
                        id={`formation-btn-${form}`}
                        key={form}
                        onClick={() => handleChangeFormation(form)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                          squad.formation === form
                            ? "bg-slate-900 border-slate-950 text-yellow-400 dark:bg-white dark:border-white dark:text-slate-900"
                            : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        {form}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Play style setting */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block mb-2">
                    Style de Jeu Collectif
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Possession", "Contre-Rapide", "Sur les Ailes", "Long Ballon"] as PlayStyleType[]).map((style) => (
                      <button
                        id={`playstyle-btn-${style.replace(/\s+/g, '-').toLowerCase()}`}
                        key={style}
                        onClick={() => handleChangePlayStyle(style)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all truncate text-left cursor-pointer ${
                          squad.playStyle === style
                            ? "bg-slate-900 border-slate-950 text-yellow-400 dark:bg-white dark:border-white dark:text-slate-900"
                            : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        ⚽ {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Acquired Player Roster listing */}
            <div className="px-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">
                  Mon Effectif de Joueurs ({myPlayers.length})
                </span>
                <span className="text-[9px] text-slate-500 font-medium">Faites défiler pour voir vos recrues</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none">
                {myPlayers.map((player) => {
                  const isStarter = Object.values(squad.starters).some(
                    (p) => p && (p as Player).id === player.id
                  );
                  return (
                    <div key={player.id} className="relative shrink-0 snap-start">
                      <PlayerCard player={player} size="sm" />
                      {isStarter && (
                        <span className="absolute -top-1 -left-1 bg-yellow-400 text-slate-950 text-[8px] uppercase tracking-widest font-extrabold py-0.5 px-1.5 rounded-md shadow-xs border border-slate-950">
                          TITULAIRE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECRUIT & SHOP AGENTS */}
        {activeTab === "shop" && (
          <div className="animate-fade-in">
            <PacksShop
              gp={gp}
              coins={coins}
              onDeductFunds={handleDeductFunds}
              onPlayerAcquired={handlePlayerAcquired}
            />
          </div>
        )}

        {/* TAB 3: MATCH SIMULATOR AREA */}
        {activeTab === "matches" && (
          <div className="animate-fade-in">
            <MatchSimulation
              userTeamStrength={collectiveStrength}
              userTeamChemistry={chemistry}
              onRewardGranted={handleMatchRewardGranted}
            />
          </div>
        )}

        {/* TAB 4: GEMINI TACTICAL COACH */}
        {activeTab === "coach" && (
          <div className="p-4 space-y-4 animate-fade-in">
            
            {/* Advice triggering head card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="font-extrabold tracking-tight text-sm">Rapport Tactique Intelligent</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
                Notre coach IA analyse en temps réel la synergie de vos titulaires, vos postes faibles et vous propose de redoutables schémas de jeu personnalisés.
              </p>

              <button
                id="fetch-coach-advice-btn"
                onClick={handleFetchCoachAdvice}
                disabled={isCoachLoading}
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isCoachLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calcul tactique en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Consulter le Coach Tactique 🧠</span>
                  </>
                )}
              </button>
            </div>

            {/* Coach review presentation */}
            {coachAdvice ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 shadow-xs space-y-4 animate-slide-up">
                
                {/* Coach Profile header */}
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl shadow-inner">
                    {coachAdvice.coachAvatarEmoji || "👔"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {coachAdvice.coachName || "Coach Tactique"}
                    </h4>
                    <span className="text-[9px] uppercase tracking-widest text-indigo-500 font-bold">
                      Conseiller Football IA
                    </span>
                  </div>

                  {/* Tactical rating badge */}
                  <div className="ml-auto bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 py-1.5 px-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-center shrink-0">
                    <span className="text-[8px] uppercase tracking-wider block font-bold">Note Tactique</span>
                    <span className="font-mono text-base font-black">{coachAdvice.tacticalRating}/100</span>
                  </div>
                </div>

                {/* Analysis paragraphs */}
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {coachAdvice.analysisParagraphs?.map((paragraph, idx) => (
                    <p key={idx} className="bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-900">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Target recommendation spotlight */}
                {coachAdvice.recommendedTarget && (
                  <div className="bg-amber-400/5 border border-amber-500/20 p-3.5 rounded-2xl">
                    <span className="text-[9px] uppercase tracking-wider text-amber-500 font-extrabold block mb-1">
                      🎯 Recrue Prioritaire Recommandée
                    </span>
                    <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                      {coachAdvice.recommendedTarget.playerName}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal italic">
                      "{coachAdvice.recommendedTarget.reason}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              !isCoachLoading && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Aucun rapport tactique actif. Appuyez sur le bouton ci-dessus pour consulter le coach !
                </div>
              )
            )}

          </div>
        )}

        {/* TAB 5: TIKTOK VIDEO GENERATOR STUDIO */}
        {activeTab === "tiktok" && (
          <div className="animate-fade-in">
            <TikTokStudio myPlayers={myPlayers} />
          </div>
        )}

      </div>

      {/* Position Selection Modal backdrop overlay */}
      {selectingPosition && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-40 flex items-end justify-center p-0 md:p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[32px] md:rounded-[28px] overflow-hidden max-h-[85%] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up">
            
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Assigner le poste : {selectingPosition}
                </h3>
                <span className="text-[10px] text-slate-500">Choisissez un joueur disponible de votre effectif</span>
              </div>
              <button
                id="close-selection-btn"
                onClick={() => setSelectingPosition(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* List scroll of candidates */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2.5 gap-3.5">
              {/* Option to clear/leave slot empty */}
              <button
                id="clear-spot-btn"
                onClick={() => handleSelectStarterForPosition(null)}
                className="col-span-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Laisser le poste vide 🚫
              </button>

              {availableRosterForSelection.length > 0 ? (
                availableRosterForSelection.map((player) => (
                  <div key={player.id} className="flex flex-col items-center">
                    <PlayerCard
                      player={player}
                      size="sm"
                      onClick={() => handleSelectStarterForPosition(player)}
                    />
                  </div>
                ))
              ) : (
                <p className="col-span-full py-6 text-center text-slate-450 text-xs">
                  Aucun autre joueur disponible. Ouvrez des packs pour recruter ! 🎁
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Navigation Rail */}
      <div id="mobile-nav-rail" className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-900 flex items-center justify-around px-4 z-30 select-none">
        
        {/* Tab 1: Tactics Pitch */}
        <button
          id="nav-tab-tactics"
          onClick={() => { setActiveTab("tactics"); setSelectingPosition(null); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "tactics" ? "text-violet-600 dark:text-yellow-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Layout className="w-5 h-5 stroke-[2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Tactique</span>
        </button>

        {/* Tab 2: Packs Store */}
        <button
          id="nav-tab-shop"
          onClick={() => { setActiveTab("shop"); setSelectingPosition(null); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "shop" ? "text-violet-600 dark:text-yellow-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <ShoppingBag className="w-5 h-5 stroke-[2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Recruter</span>
        </button>

        {/* Tab 3: Match Sim */}
        <button
          id="nav-tab-matches"
          onClick={() => { setActiveTab("matches"); setSelectingPosition(null); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "matches" ? "text-violet-600 dark:text-yellow-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Gamepad2 className="w-5 h-5 stroke-[2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Simuler</span>
        </button>

        {/* Tab 4: AI Advisor */}
        <button
          id="nav-tab-coach"
          onClick={() => { setActiveTab("coach"); setSelectingPosition(null); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "coach" ? "text-violet-600 dark:text-yellow-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <BrainCircuit className="w-5 h-5 stroke-[2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider">IA Coach</span>
        </button>

        {/* Tab 5: TikTok Video Promo Studio */}
        <button
          id="nav-tab-tiktok"
          onClick={() => { setActiveTab("tiktok"); setSelectingPosition(null); }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === "tiktok" ? "text-violet-600 dark:text-yellow-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Video className="w-5 h-5 stroke-[2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider">TikTok Studio</span>
        </button>

      </div>
    </MobileFrame>
  );
}
