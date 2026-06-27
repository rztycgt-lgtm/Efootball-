import React, { useState, useEffect, useRef } from "react";
import { OPPONENTS, generateSimulatedMatch } from "../utils";
import { MatchCommentaryEvent } from "../types";
import { Trophy, ChevronRight, Play, RefreshCw, Star, Users, ArrowLeft, Disc, Gamepad2, Zap } from "lucide-react";
import InteractiveGame2D from "./InteractiveGame2D";

interface MatchSimulationProps {
  userTeamStrength: number;
  userTeamChemistry: number;
  onRewardGranted: (gp: number, coins: number) => void;
}

export default function MatchSimulation({ userTeamStrength, userTeamChemistry, onRewardGranted }: MatchSimulationProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<typeof OPPONENTS[0] | null>(null);
  const [matchState, setMatchState] = useState<"idle" | "playing" | "finished">("idle");
  const [interactiveModeOpponent, setInteractiveModeOpponent] = useState<typeof OPPONENTS[0] | null>(null);
  const [fullMatchEvents, setFullMatchEvents] = useState<MatchCommentaryEvent[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<MatchCommentaryEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  
  // Scoring status
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [possession, setPossession] = useState<number>(50);
  const [shots, setShots] = useState<{ home: number; away: number }>({ home: 0, away: 0 });

  const eventTimer = useRef<NodeJS.Timeout | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (eventTimer.current) clearInterval(eventTimer.current);
    };
  }, []);

  // Auto scroll match feed to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleEvents]);

  // Start simulated match sequence
  const handleStartMatch = (opponent: typeof OPPONENTS[0]) => {
    setSelectedOpponent(opponent);
    setMatchState("playing");
    setHomeScore(0);
    setAwayScore(0);
    setShots({ home: 0, away: 0 });
    setPossession(50);
    
    // Generate the complete script of match events
    const generated = generateSimulatedMatch(
      userTeamStrength,
      userTeamChemistry,
      opponent.name,
      opponent.rating
    );
    
    setFullMatchEvents(generated);
    setVisibleEvents([generated[0]]); // Initial kickoff
    setCurrentEventIndex(0);

    // Set interactive interval simulation
    if (eventTimer.current) clearInterval(eventTimer.current);
    
    let index = 0;
    eventTimer.current = setInterval(() => {
      index++;
      if (index < generated.length) {
        const ev = generated[index];
        setCurrentEventIndex(index);
        
        // Add event
        setVisibleEvents((prev) => [...prev, ev]);

        // Adjust scoreboard & stats based on event type
        if (ev.type === "GOAL") {
          if (ev.team === "HOME") {
            setHomeScore((s) => s + 1);
            setShots((sh) => ({ ...sh, home: sh.home + 1 }));
          } else {
            setAwayScore((s) => s + 1);
            setShots((sh) => ({ ...sh, away: sh.away + 1 }));
          }
        } else if (ev.type === "SAVE" || ev.type === "SHOOT") {
          if (ev.team === "HOME") {
            setShots((sh) => ({ ...sh, home: sh.home + 1 }));
          } else {
            setShots((sh) => ({ ...sh, away: sh.away + 1 }));
          }
        }

        // Randomize ball possession values slightly
        setPossession(Math.min(75, Math.max(25, 50 + (userTeamStrength - opponent.rating) / 4 + Math.round((Math.random() - 0.5) * 12))));

      } else {
        // Match ended
        if (eventTimer.current) clearInterval(eventTimer.current);
        setMatchState("finished");

        // Compute rewards in GP & Coins based on outcome
        let gpReward = 5000;
        let coinReward = 10;
        
        const finalHome = generated.filter((e) => e.type === "GOAL" && e.team === "HOME").length;
        const finalAway = generated.filter((e) => e.type === "GOAL" && e.team === "AWAY").length;

        if (finalHome > finalAway) {
          gpReward = 15000; // win bonus
          coinReward = 50;
        } else if (finalHome === finalAway) {
          gpReward = 8000; // draw bonus
          coinReward = 20;
        }

        onRewardGranted(gpReward, coinReward);
      }
    }, 2000); // Step every 2 seconds for dramatic effect
  };

  const handleLeaveMatch = () => {
    setSelectedOpponent(null);
    setMatchState("idle");
    setVisibleEvents([]);
    if (eventTimer.current) clearInterval(eventTimer.current);
  };

  // If interactive playable match mode is selected
  if (interactiveModeOpponent) {
    return (
      <InteractiveGame2D
        userTeamStrength={userTeamStrength}
        onRewardGranted={onRewardGranted}
        onClose={() => setInteractiveModeOpponent(null)}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Simulation Hub Header */}
      {matchState === "idle" && (
        <>
          <div className="bg-gradient-to-r from-violet-900 to-indigo-900 text-white rounded-2xl p-4 border border-violet-800 shadow-md">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-extrabold tracking-tight text-sm">Championnat d'Élite Dream Team</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Affrontez de redoutables adversaires. Choisissez de simuler rapidement ou de **jouer manuellement** sur le terrain pour marquer vos propres buts !
            </p>

            {/* User team strength panel */}
            <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-white/10 text-center">
              <div className="bg-white/5 py-1.5 px-2 rounded-xl">
                <span className="text-[9px] uppercase text-slate-350 block">Force Titulaires</span>
                <span className="font-mono text-sm font-black text-yellow-400">{userTeamStrength}</span>
              </div>
              <div className="bg-white/5 py-1.5 px-2 rounded-xl">
                <span className="text-[9px] uppercase text-slate-350 block">Collectif</span>
                <span className="font-mono text-sm font-black text-cyan-400">{userTeamChemistry}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              Sélectionnez un club adversaire
            </h3>
          </div>

          {/* List of Opponent Clubs */}
          <div className="space-y-3.5">
            {OPPONENTS.map((opp) => {
              const diff = userTeamStrength - opp.rating;
              let diffLabel = "Équilibré";
              let diffColor = "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
              if (diff > 5) {
                diffLabel = "Facile";
                diffColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
              } else if (diff < -5) {
                diffLabel = "Difficile";
                diffColor = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
              }

              return (
                <div 
                  key={opp.name}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-slate-200 dark:hover:border-slate-800 transition-all animate-fade-in"
                >
                  <div className="flex items-center gap-3.5 pr-1 flex-1">
                    {/* Club logo emoji placeholder */}
                    <div className="w-11 h-11 bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {opp.logo}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">{opp.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono font-bold text-slate-550 dark:text-slate-450">
                          Force: {opp.rating}
                        </span>
                        <span className={`text-[8px] uppercase tracking-wider font-extrabold py-0.5 px-1.5 rounded-md border ${diffColor}`}>
                          {diffLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Play Action Triggers Side-by-side */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Simuler button */}
                    <button
                      id={`play-match-btn-${opp.name.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => handleStartMatch(opp)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 text-[9px] font-bold"
                      title={`Simuler automatiquement contre ${opp.name}`}
                    >
                      <Play className="w-3.5 h-3.5 mb-0.5 text-slate-600 dark:text-slate-300" />
                      <span>Simuler</span>
                    </button>

                    {/* Jouer button */}
                    <button
                      id={`play-interactive-btn-${opp.name.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setInteractiveModeOpponent(opp)}
                      className="px-2.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 text-[9px] font-bold shadow-xs shadow-violet-500/10"
                      title={`Jouer en direct contre ${opp.name}`}
                    >
                      <Gamepad2 className="w-3.5 h-3.5 mb-0.5" />
                      <span>Jouer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Active Live Match Simulator screen */}
      {selectedOpponent && matchState !== "idle" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[28px] overflow-hidden shadow-xl flex flex-col h-[640px]">
          
          {/* Soccer Scoreboard panel */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 text-white text-center border-b border-slate-850 relative">
            
            {/* Spinning ball icon representation */}
            <div className="absolute top-2 left-2 flex items-center gap-1 opacity-70">
              <Disc className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="text-[8px] uppercase tracking-widest font-extrabold">LIVE SIM</span>
            </div>

            {/* Score Display Row */}
            <div className="flex items-center justify-between mt-2 px-2 select-none">
              <div className="flex flex-col items-center flex-1 max-w-[110px]">
                <span className="text-2xl">🛡️</span>
                <span className="font-extrabold text-[11px] truncate max-w-full text-slate-300 mt-1">Vous</span>
                <span className="text-[9px] text-slate-450 font-mono">STR: {userTeamStrength}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl font-black font-mono tracking-tighter text-yellow-400 bg-black/40 px-3.5 py-1.5 rounded-2xl border border-slate-800">
                  {homeScore}
                </span>
                <span className="text-slate-450 font-bold">:</span>
                <span className="text-3xl font-black font-mono tracking-tighter text-yellow-400 bg-black/40 px-3.5 py-1.5 rounded-2xl border border-slate-800">
                  {awayScore}
                </span>
              </div>

              <div className="flex flex-col items-center flex-1 max-w-[110px]">
                <span className="text-2xl">{selectedOpponent.logo}</span>
                <span className="font-extrabold text-[11px] truncate max-w-full text-slate-300 mt-1">{selectedOpponent.name}</span>
                <span className="text-[9px] text-slate-450 font-mono">STR: {selectedOpponent.rating}</span>
              </div>
            </div>

            {/* Simulated Live Game Minute indicator */}
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="bg-slate-800 text-white font-mono font-bold px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase">
                {visibleEvents[visibleEvents.length - 1]?.minute ?? 0}' MINUTE
              </span>
            </div>
          </div>

          {/* Interactive Match Stats Dashboard */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850/30 border-b border-slate-100 dark:border-slate-850 grid grid-cols-2 gap-3 text-center text-[10px]">
            <div>
              <span className="text-slate-450 uppercase font-semibold">Tirs au but</span>
              <div className="font-bold font-mono text-xs text-slate-700 dark:text-slate-200 mt-0.5">
                {shots.home} - {shots.away}
              </div>
            </div>
            <div>
              <span className="text-slate-450 uppercase font-semibold">Possession de balle</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="font-bold font-mono text-[9px] text-slate-600 dark:text-slate-300">{possession}%</span>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 flex-1 overflow-hidden flex">
                  <div className="bg-violet-600 h-full" style={{ width: `${possession}%` }} />
                </div>
                <span className="font-bold font-mono text-[9px] text-slate-600 dark:text-slate-300">{100 - possession}%</span>
              </div>
            </div>
          </div>

          {/* Real-time Match Commentary Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed">
            {visibleEvents.map((ev, i) => {
              const isGoal = ev.type === "GOAL";
              const isFullTime = ev.type === "FULLTIME";
              
              let bubbleStyle = "bg-slate-850 border border-slate-800 text-slate-300";
              if (isGoal) {
                bubbleStyle = ev.team === "HOME"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : "bg-rose-950/40 border-rose-500/30 text-rose-300";
              } else if (isFullTime) {
                bubbleStyle = "bg-violet-950/40 border-violet-500/30 text-violet-300 text-center";
              }

              return (
                <div 
                  id={`match-event-bubble-${i}`}
                  key={i} 
                  className={`p-3 rounded-xl transition-all duration-300 animate-slide-up ${bubbleStyle}`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 opacity-75 text-[9px] font-bold">
                    <span>⏱️ {ev.minute}' MIN</span>
                    {ev.type !== "KICKOFF" && ev.type !== "FULLTIME" && (
                      <span className="bg-black/35 py-0.5 px-1 rounded uppercase tracking-wider text-[8px]">
                        {ev.type}
                      </span>
                    )}
                  </div>
                  <p className={isGoal ? "font-bold text-xs" : ""}>{ev.text}</p>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Panel: Post-game results and navigation */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            {matchState === "playing" ? (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-violet-500" />
                <span>Simulation en cours... Veuillez patienter</span>
              </div>
            ) : (
              <div className="w-full text-center space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Match terminé ! Vos récompenses ont été créditées. 🏆
                </div>
                
                <button
                  id="leave-simulation-btn"
                  onClick={handleLeaveMatch}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/10 cursor-pointer transition-transform active:scale-97"
                >
                  Retourner au hub 🏡
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
