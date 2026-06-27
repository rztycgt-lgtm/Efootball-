import React, { useState } from "react";
import { PackConfig, DRAW_PACKS, openPlayerPack } from "../utils";
import { Player } from "../types";
import PlayerCard from "./PlayerCard";
import { Sparkles, Coins, Gift, ChevronRight, X, Volume2 } from "lucide-react";

interface PacksShopProps {
  gp: number;
  coins: number;
  onDeductFunds: (cost: number, currency: "gp" | "coins") => boolean;
  onPlayerAcquired: (player: Player) => void;
}

export default function PacksShop({ gp, coins, onDeductFunds, onPlayerAcquired }: PacksShopProps) {
  const [openingPack, setOpeningPack] = useState<PackConfig | null>(null);
  const [revealedPlayer, setRevealedPlayer] = useState<Player | null>(null);
  const [animationStage, setAnimationStage] = useState<"idle" | "flashing" | "revealed">("idle");

  const handleDrawPack = (pack: PackConfig) => {
    // Attempt funds deduction
    const success = onDeductFunds(pack.cost, pack.currency);
    if (!success) {
      alert("Fonds insuffisants ! Participez à des matchs pour gagner du GP ou réinitialisez votre solde.");
      return;
    }

    setOpeningPack(pack);
    setAnimationStage("flashing");

    // Sequence the dramatic reveal animations!
    setTimeout(() => {
      const drawnPlayer = openPlayerPack(pack);
      setRevealedPlayer(drawnPlayer);
      setAnimationStage("revealed");
    }, 2200); // 2.2 seconds of dramatic anticipation lights!
  };

  const handleConfirmAcquisition = () => {
    if (revealedPlayer) {
      onPlayerAcquired(revealedPlayer);
    }
    // Reset state
    setOpeningPack(null);
    setRevealedPlayer(null);
    setAnimationStage("idle");
  };

  return (
    <div className="p-4 space-y-4">
      {/* Wallet / Currency status dashboard */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-3.5 border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">Mon Budget Club</span>
          <h3 className="text-sm font-semibold text-slate-200 mt-0.5">Recrutez de nouvelles légendes</h3>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0 text-right">
          <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span>{gp.toLocaleString()} GP</span>
          </div>
          <div className="flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{coins.toLocaleString()} Coins</span>
          </div>
        </div>
      </div>

      {/* Packs Catalog header */}
      <div className="flex items-center gap-2 mb-1">
        <Gift className="w-4 h-4 text-violet-500" />
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
          Agents de Recrutement Actifs
        </h3>
      </div>

      {/* List of draw packs */}
      <div className="space-y-3">
        {DRAW_PACKS.map((pack) => {
          const isGp = pack.currency === "gp";
          return (
            <div 
              key={pack.name}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-slate-200 dark:hover:border-slate-800 transition-all"
            >
              <div className="pr-3 flex-1">
                <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 border ${
                  pack.name.includes("Légendes") 
                    ? "bg-amber-400/10 text-amber-500 border-amber-500/20" 
                    : pack.name.includes("Vedettes")
                    ? "bg-violet-400/10 text-violet-500 border-violet-500/20"
                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800"
                }`}>
                  {pack.name.includes("Légendes") ? "SPECIAL EPIC" : "AGENT DE CHAMPIONNAT"}
                </span>

                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{pack.name}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{pack.description}</p>
                
                {/* Drop rates indicator */}
                <span className="text-[9px] text-slate-450 dark:text-slate-500 block mt-1.5 font-medium">
                  Taux: Epic ({(pack.epicRate * 100).toFixed(0)}%) | Vedettes ({(pack.trendingRate * 100).toFixed(0)}%)
                </span>
              </div>

              {/* Sign Action Button */}
              <button
                id={`sign-pack-btn-${pack.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleDrawPack(pack)}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center min-w-20 gap-0.5 shadow-xs border transition-all cursor-pointer ${
                  isGp 
                    ? "bg-slate-900 border-slate-950 text-yellow-400 hover:bg-slate-800 dark:bg-slate-800 dark:border-slate-750 dark:hover:bg-slate-700" 
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white hover:opacity-95"
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider text-white/70">Signer</span>
                <span className="font-mono flex items-center gap-0.5">
                  {isGp ? "🪙" : "💎"} {pack.cost.toLocaleString()}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Dramatic Full-screen Pack Opening Animation Overlay */}
      {openingPack && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 animate-fade-in text-center overflow-hidden">
          
          {/* Animated cosmic/energy background */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center">
            <div className="absolute w-72 h-72 rounded-full bg-violet-600/35 blur-3xl animate-pulse" />
            <div className="absolute w-96 h-96 rounded-full bg-cyan-600/25 blur-3xl animate-pulse delay-500" />
            
            {/* Rapid rotating energy lights during flashing stage */}
            {animationStage === "flashing" && (
              <div className="absolute w-[600px] h-[600px] rounded-full border border-dashed border-white/20 animate-spin" style={{ animationDuration: "3s" }} />
            )}
          </div>

          {/* Stage 1: The Build-Up suspense animation */}
          {animationStage === "flashing" && (
            <div className="relative z-10 space-y-6 max-w-xs">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Visual shockwave rings */}
                <span className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-ping" />
                <span className="absolute inset-4 rounded-full border-2 border-violet-400/75 animate-ping delay-300" />
                
                <div className="w-20 h-20 bg-gradient-to-tr from-yellow-500 via-violet-600 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center text-4xl animate-bounce">
                  ⚽
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-yellow-400 text-[10px] font-extrabold tracking-widest uppercase animate-pulse">
                  Négociations en cours...
                </span>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">
                  Recrutement de l'agent
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  L'ambassadeur de la Dream Team finalise le contrat de la future vedette...
                </p>
              </div>

              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 via-violet-500 to-cyan-400 h-full rounded-full animate-progress" style={{ animationDuration: "2s" }} />
              </div>
            </div>
          )}

          {/* Stage 2: The Magnificent Reveal of the drawn player! */}
          {animationStage === "revealed" && revealedPlayer && (
            <div className="relative z-10 space-y-6 max-w-sm flex flex-col items-center">
              
              {/* Confetti & Flash effect indicators */}
              <div className="text-xs uppercase font-extrabold tracking-widest px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-full shadow-lg shadow-yellow-500/25 animate-bounce">
                🎉 JOUEUR RECRUTÉ ! 🎉
              </div>

              {/* Glowing Player Card Render */}
              <div className="transform scale-110 my-4 filter drop-shadow-[0_15px_30px_rgba(234,179,8,0.45)]">
                <PlayerCard player={revealedPlayer} size="md" />
              </div>

              {/* Rarity and descriptive presentation */}
              <div className="space-y-1 bg-black/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl w-full max-w-xs">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {revealedPlayer.rarity} - {revealedPlayer.position}
                </p>
                <h4 className="text-base font-extrabold text-white">
                  {revealedPlayer.name}
                </h4>
                <p className="text-[11px] text-slate-300 font-medium">
                  Signed to club {revealedPlayer.club}
                </p>

                {/* Main stats display */}
                <div className="grid grid-cols-6 gap-1 border-t border-slate-800 mt-2.5 pt-2.5 text-[9px] font-bold text-slate-400">
                  <div>VIT<span className="block font-mono text-white text-xs">{revealedPlayer.stats.pac}</span></div>
                  <div>TIR<span className="block font-mono text-white text-xs">{revealedPlayer.stats.sho}</span></div>
                  <div>PAS<span className="block font-mono text-white text-xs">{revealedPlayer.stats.pas}</span></div>
                  <div>DRI<span className="block font-mono text-white text-xs">{revealedPlayer.stats.dri}</span></div>
                  <div>DEF<span className="block font-mono text-white text-xs">{revealedPlayer.stats.def}</span></div>
                  <div>PHY<span className="block font-mono text-white text-xs">{revealedPlayer.stats.phy}</span></div>
                </div>
              </div>

              {/* Confirm Acquisition Button */}
              <button
                id="sign-confirm-btn"
                onClick={handleConfirmAcquisition}
                className="w-full max-w-xs py-3 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer"
              >
                Ajouter à mon effectif ✍️
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
