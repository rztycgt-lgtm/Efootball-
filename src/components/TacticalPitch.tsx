import React from "react";
import { Squad, Player, PlayerPosition, FormationType } from "../types";
import PlayerCard from "./PlayerCard";
import { User, Shield, Zap } from "lucide-react";

interface TacticalPitchProps {
  squad: Squad;
  onPositionClick: (position: PlayerPosition) => void;
}

// Map each formation to specific absolute % coordinates on our interactive 2D soccer field
// Top is 0% (Forwards), Bottom is 100% (GK)
const FORMATION_COORDINATES: Record<FormationType, Record<PlayerPosition, { top: string; left: string }>> = {
  "4-3-3": {
    GK: { top: "86%", left: "50%" },
    CB: { top: "70%", left: "50%" },
    LB: { top: "66%", left: "15%" },
    RB: { top: "66%", left: "85%" },
    DMF: { top: "50%", left: "50%" },
    CMF: { top: "40%", left: "30%" },
    AMF: { top: "34%", left: "70%" },
    LWF: { top: "16%", left: "18%" },
    RWF: { top: "16%", left: "82%" },
    CF: { top: "12%", left: "50%" }
  },
  "4-4-2": {
    GK: { top: "86%", left: "50%" },
    CB: { top: "70%", left: "50%" },
    LB: { top: "66%", left: "15%" },
    RB: { top: "66%", left: "85%" },
    DMF: { top: "48%", left: "35%" },
    CMF: { top: "48%", left: "65%" },
    AMF: { top: "34%", left: "15%" }, // LM / LWM equivalent in 4-4-2
    LWF: { top: "34%", left: "85%" }, // RM / RWM equivalent
    RWF: { top: "14%", left: "35%" }, // Left Striker
    CF: { top: "14%", left: "65%" }  // Right Striker
  },
  "3-5-2": {
    GK: { top: "86%", left: "50%" },
    CB: { top: "74%", left: "50%" },
    LB: { top: "70%", left: "25%" }, // LCB
    RB: { top: "70%", left: "75%" }, // RCB
    DMF: { top: "54%", left: "32%" }, // LDM
    CMF: { top: "54%", left: "68%" }, // RDM
    AMF: { top: "42%", left: "50%" }, // Central AMF
    LWF: { top: "40%", left: "12%" }, // LM
    RWF: { top: "40%", left: "88%" }, // RM
    CF: { top: "14%", left: "50%" }  // Striker
  },
  "4-2-3-1": {
    GK: { top: "86%", left: "50%" },
    CB: { top: "72%", left: "50%" },
    LB: { top: "68%", left: "15%" },
    RB: { top: "68%", left: "85%" },
    DMF: { top: "54%", left: "32%" },
    CMF: { top: "54%", left: "68%" },
    AMF: { top: "36%", left: "50%" },
    LWF: { top: "32%", left: "18%" }, // LAM
    RWF: { top: "32%", left: "82%" }, // RAM
    CF: { top: "12%", left: "50%" }
  }
};

export default function TacticalPitch({ squad, onPositionClick }: TacticalPitchProps) {
  const currentCoords = FORMATION_COORDINATES[squad.formation] || FORMATION_COORDINATES["4-3-3"];
  
  const positionsList: PlayerPosition[] = ["GK", "CB", "LB", "RB", "DMF", "CMF", "AMF", "LWF", "RWF", "CF"];

  return (
    <div className="px-4 py-2">
      <div 
        id="soccer-pitch"
        className="relative w-full aspect-[3/4] max-h-[460px] bg-emerald-800 rounded-[28px] overflow-hidden border-4 border-slate-900/45 dark:border-slate-800 shadow-xl"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.06) 100%),
            linear-gradient(to bottom, #065f46 0%, #064e3b 100%)
          `
        }}
      >
        {/* Grass Stripes Pattern */}
        <div className="absolute inset-0 flex flex-col pointer-events-none select-none opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
          ))}
        </div>

        {/* Outer boundaries & lines */}
        <div className="absolute inset-2.5 border-2 border-white/20 rounded-2xl pointer-events-none" />

        {/* Halfway line */}
        <div className="absolute top-1/2 left-2.5 right-2.5 h-[2px] bg-white/20 pointer-events-none" />

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/20 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/20 rounded-full pointer-events-none" />

        {/* Penalty Area Top */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white/20 pointer-events-none rounded-b-xl" />
        {/* Six-yard Box Top */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-10 border-2 border-b-0 border-white/20 pointer-events-none rounded-b" />

        {/* Penalty Area Bottom */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white/20 pointer-events-none rounded-t-xl" />
        {/* Six-yard Box Bottom */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-24 h-10 border-2 border-t-0 border-white/20 pointer-events-none rounded-t" />

        {/* Tactical Positions Map */}
        {positionsList.map((pos) => {
          const player = squad.starters[pos];
          const coord = currentCoords[pos];
          
          if (!coord) return null;

          return (
            <div
              key={pos}
              style={{
                top: coord.top,
                left: coord.left,
                transform: "translate(-50%, -50%)"
              }}
              className="absolute z-20 flex flex-col items-center group transition-all duration-350"
            >
              {/* Player Button / Trigger */}
              <button
                id={`pitch-pos-btn-${pos}`}
                onClick={() => onPositionClick(pos)}
                className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  player
                    ? "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-yellow-400 text-yellow-400 hover:scale-110"
                    : "bg-black/45 hover:bg-black/60 border-dashed border-white/50 text-white/80 hover:border-violet-400 hover:text-violet-300 hover:scale-105"
                }`}
                title={player ? `Modifier ${player.name} (${pos})` : `Ajouter un joueur au poste ${pos}`}
              >
                {player ? (
                  <span className="text-[10px] font-black leading-none uppercase tracking-tighter">
                    {player.name.substring(0, 3)}.
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase">{pos}</span>
                )}

                {/* Micro floating rating bubble */}
                {player && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-900 text-[8px] font-extrabold w-4.5 h-4.5 rounded-full border border-slate-900 flex items-center justify-center shadow-xs">
                    {player.rating}
                  </span>
                )}
              </button>

              {/* Position Indicator Label */}
              <span className="mt-1 text-[9px] font-extrabold tracking-widest text-white/90 bg-black/60 py-0.5 px-1.5 rounded-md leading-none shadow-xs uppercase select-none">
                {pos}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
