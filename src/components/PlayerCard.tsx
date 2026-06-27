import React from "react";
import { Player } from "../types";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  isDragging?: boolean;
}

export default function PlayerCard({ player, onClick, size = "md", isDragging }: PlayerCardProps) {
  // Styling according to card rarity
  const rarityBgs: Record<string, string> = {
    Epic: "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-900 border-amber-300 shadow-[0_0_15px_rgba(234,179,8,0.4)]",
    Legend: "bg-gradient-to-br from-purple-600 via-rose-500 to-yellow-500 text-white border-yellow-300 shadow-[0_0_18px_rgba(236,72,153,0.5)]",
    Trending: "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white border-blue-400 shadow-md",
    Standard: "bg-gradient-to-br from-slate-800 to-slate-950 text-slate-100 border-slate-700"
  };

  const currentBg = rarityBgs[player.rarity] || rarityBgs.Standard;

  if (size === "sm") {
    return (
      <div 
        onClick={onClick}
        className={`w-20 h-28 rounded-xl border p-1.5 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer hover:scale-105 active:scale-95 transition-all ${currentBg}`}
      >
        {/* Shiny Overlay background layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none transform -skew-x-12 animate-pulse" />
        
        {/* Rating and Position Row */}
        <div className="flex items-center justify-between text-[10px] font-extrabold z-10 leading-none">
          <span className="bg-black/20 px-1 rounded">{player.position}</span>
          <span className="text-xs tracking-tighter">{player.rating}</span>
        </div>

        {/* Small player portrait/emoji mockup */}
        <div className="text-center text-xl my-1 z-10">
          {player.rarity === "Legend" || player.rarity === "Epic" ? "🏆" : "🏃‍♂️"}
        </div>

        {/* Name and club */}
        <div className="text-center z-10 leading-none">
          <p className="text-[9px] font-bold truncate max-w-full tracking-tight">{player.name}</p>
          <span className="text-[7px] text-white/70 block truncate mt-0.5">{player.club}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`w-32 h-44 rounded-2xl border-2 p-2.5 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer hover:scale-[1.03] active:scale-97 transition-all ${currentBg} ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      {/* Visual background lights for premium cards */}
      {(player.rarity === "Legend" || player.rarity === "Epic") && (
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 rounded-full blur-xl animate-pulse pointer-events-none" />
      )}
      
      {/* Header section: rating & position */}
      <div className="flex items-start justify-between z-10">
        <div className="flex flex-col leading-none">
          <span className="text-lg font-black tracking-tight font-mono">{player.rating}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 text-white/95 py-0.5 px-1.5 rounded-md mt-1 self-start">
            {player.position}
          </span>
        </div>

        {/* Nationality flag representation (simple visual placeholder) */}
        <span className="text-sm bg-black/10 py-0.5 px-1 rounded-md" title={player.nationality}>
          {player.nationality === "France" ? "🇫🇷" : 
           player.nationality === "Argentine" ? "🇦🇷" :
           player.nationality === "Brésil" ? "🇧🇷" :
           player.nationality === "Angleterre" ? "🏴󠁧󠁢󠁥󠁮󠁧󠁿" :
           player.nationality === "Espagne" ? "🇪🇸" : 
           player.nationality === "Belgique" ? "🇧🇪" : "🌍"}
        </span>
      </div>

      {/* Center visual avatar */}
      <div className="text-center my-1 z-10 relative">
        <div className="text-3xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
          {player.rarity === "Legend" ? "👑" :
           player.rarity === "Epic" ? "🌟" : "⚽"}
        </div>
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-widest font-extrabold px-1.5 bg-black/40 text-yellow-300 rounded">
          {player.rarity}
        </span>
      </div>

      {/* Footer section: Player Name & Primary stats */}
      <div className="z-10 text-center">
        <h4 className="text-xs font-extrabold tracking-tight truncate leading-tight">
          {player.name}
        </h4>
        <span className="text-[8px] text-white/80 block truncate font-medium mt-0.5">
          {player.club}
        </span>

        {/* Micro Radar Stats row */}
        <div className="grid grid-cols-3 gap-0.5 mt-1.5 pt-1.5 border-t border-white/10 text-[7px] font-bold uppercase tracking-tighter text-white/90">
          <div>VIT <span className="font-mono block text-[8px] font-black">{player.stats.pac}</span></div>
          <div>TIR <span className="font-mono block text-[8px] font-black">{player.stats.sho}</span></div>
          <div>DRI <span className="font-mono block text-[8px] font-black">{player.stats.dri}</span></div>
        </div>
      </div>
    </div>
  );
}
