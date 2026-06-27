import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Play, Pause, Video, Download, HelpCircle, Trophy, Volume2, VolumeX, Eye, Flame, FileVideo } from "lucide-react";
import { Player } from "../types";

interface TikTokStudioProps {
  myPlayers: Player[];
}

type VideoTheme = "cyber" | "cosmic" | "ice" | "drill";
type SoundtrackType = "phonk" | "hype" | "epic" | "lofi";

export default function TikTokStudio({ myPlayers }: TikTokStudioProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(myPlayers[0] || null);
  const [activeTheme, setActiveTheme] = useState<VideoTheme>("cosmic");
  const [soundtrack, setSoundtrack] = useState<SoundtrackType>("phonk");
  const [caption, setCaption] = useState<string>("MY UNSTOPPABLE SQUAD CARD! 🤯🔥");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(12800);
  const [comments, setComments] = useState<number>(435);
  const [showRecordingGuide, setShowRecordingGuide] = useState<boolean>(false);

  // Video recording export states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);

  // Audio nodes refs for real-time Web Audio synthesizer soundtrack beats!
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const synthStepRef = useRef<number>(0);
  const recAudioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Canvas ref for video background visual effects
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-increment likes/comments for realism
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setLikes((prev) => prev + Math.floor(Math.random() * 3));
      if (Math.random() > 0.7) {
        setComments((prev) => prev + 1);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Web Audio Beat Loop
  useEffect(() => {
    if (!isAudioEnabled || !isPlaying) {
      stopAudioBeat();
      return;
    }
    startAudioBeat();
    return () => stopAudioBeat();
  }, [isAudioEnabled, isPlaying, soundtrack]);

  const startAudioBeat = () => {
    stopAudioBeat();
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    synthStepRef.current = 0;

    // Create stream destination node to feed into MediaRecorder
    try {
      const recDest = ctx.createMediaStreamDestination();
      recAudioDestRef.current = recDest;
    } catch (e) {
      console.warn("MediaStreamAudioDestinationNode not supported", e);
    }

    // Rhythmic pattern clock (bpm helper)
    let intervalTime = 150; // default for high-speed drill Phonk
    if (soundtrack === "hype") intervalTime = 135;
    if (soundtrack === "epic") intervalTime = 200;
    if (soundtrack === "lofi") intervalTime = 300;

    const playBeatStep = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") return;
      const now = audioCtxRef.current.currentTime;
      const step = synthStepRef.current;

      try {
        // Master Volume Gain
        const masterGain = audioCtxRef.current.createGain();
        masterGain.gain.setValueAtTime(0.12, now);
        masterGain.connect(audioCtxRef.current.destination);

        // Sub kick drum on every downbeat (0, 4, 8, 12...)
        if (step % 4 === 0) {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
          
          gain.gain.setValueAtTime(1.0, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.connect(gain);
          gain.connect(masterGain);
          
          if (recAudioDestRef.current) {
            gain.connect(recAudioDestRef.current);
          }

          osc.start(now);
          osc.stop(now + 0.35);
        }

        // Snare / Clap on step 4 and 12
        if (step % 8 === 4) {
          // Noise snare
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(250, now);
          
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(gain);
          gain.connect(masterGain);

          if (recAudioDestRef.current) {
            gain.connect(recAudioDestRef.current);
          }

          osc.start(now);
          osc.stop(now + 0.15);
        }

        // Hi-Hats on every alternate step
        if (step % 2 === 1) {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(8000, now);
          
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.connect(gain);
          gain.connect(masterGain);

          if (recAudioDestRef.current) {
            gain.connect(recAudioDestRef.current);
          }

          osc.start(now);
          osc.stop(now + 0.06);
        }

        // Cyber Phonk Bass melody notes
        const notes = soundtrack === "phonk" 
          ? [55, 55, 65, 55, 73, 55, 62, 55] 
          : soundtrack === "hype"
          ? [60, 60, 67, 60, 70, 70, 65, 63]
          : soundtrack === "epic"
          ? [40, 48, 40, 52, 40, 50, 40, 47]
          : [60, 0, 64, 0, 67, 0, 60, 0]; // Lo-fi chill

        const currentFreq = notes[step % notes.length];
        if (currentFreq > 0) {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          
          osc.type = soundtrack === "lofi" ? "sine" : "sawtooth";
          osc.frequency.setValueAtTime(currentFreq, now);
          
          // Synthesize cool portamento slide
          if (step % 4 === 1) {
            osc.frequency.exponentialRampToValueAtTime(currentFreq * 1.5, now + 0.12);
          }

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (soundtrack === "lofi" ? 0.45 : 0.22));

          osc.connect(gain);
          gain.connect(masterGain);

          if (recAudioDestRef.current) {
            gain.connect(recAudioDestRef.current);
          }

          osc.start(now);
          osc.stop(now + 0.5);
        }
      } catch (err) {
        // Fallback for context interruptions
      }

      synthStepRef.current = (synthStepRef.current + 1) % 16;
    };

    // Run interval
    audioIntervalRef.current = window.setInterval(playBeatStep, intervalTime);
  };

  const stopAudioBeat = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // Render Background visual particles + high end card presentation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Array<{ x: number; y: number; speed: number; size: number; color: string; angle: number }> = [];

    // Initialize particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 1.8 + 0.5,
        size: Math.random() * 2.5 + 1,
        angle: Math.random() * Math.PI * 2,
        color: activeTheme === "cyber" 
          ? "rgba(236, 72, 153, 0.75)" // Neon Pink
          : activeTheme === "cosmic"
          ? "rgba(245, 158, 11, 0.75)" // Luxury Gold
          : activeTheme === "ice"
          ? "rgba(6, 182, 212, 0.75)" // Saphir cyan
          : "rgba(139, 92, 246, 0.75)" // Violet Drill
      });
    }

    let frameCount = 0;

    const render = () => {
      if (!isPlaying) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      // Theme backgrounds
      let bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 20,
        canvas.width / 2, canvas.height / 2, canvas.height
      );

      if (activeTheme === "cyber") {
        bgGrad.addColorStop(0, "#1e0b36");
        bgGrad.addColorStop(0.5, "#0b0518");
        bgGrad.addColorStop(1, "#030107");
      } else if (activeTheme === "cosmic") {
        bgGrad.addColorStop(0, "#2c1c02");
        bgGrad.addColorStop(0.6, "#0f0801");
        bgGrad.addColorStop(1, "#000000");
      } else if (activeTheme === "ice") {
        bgGrad.addColorStop(0, "#082736");
        bgGrad.addColorStop(0.5, "#020f18");
        bgGrad.addColorStop(1, "#01050a");
      } else { // drill
        bgGrad.addColorStop(0, "#1b0a2c");
        bgGrad.addColorStop(0.6, "#0a0314");
        bgGrad.addColorStop(1, "#020105");
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon lines/grid if cyber
      if (activeTheme === "cyber") {
        ctx.strokeStyle = "rgba(236, 72, 153, 0.08)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < canvas.width; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + Math.sin(frameCount * 0.005) * 20, canvas.height);
          ctx.stroke();
        }
      }

      // Draw and move particles
      particles.forEach((p) => {
        ctx.beginPath();
        if (activeTheme === "cosmic") {
          // Draw diamond star shape
          ctx.moveTo(p.x, p.y - p.size * 2);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.lineTo(p.x, p.y + p.size * 2);
          ctx.lineTo(p.x - p.size, p.y);
          ctx.closePath();
          ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
        }
        ctx.fill();

        // Update positions
        p.y -= p.speed;
        p.x += Math.sin(frameCount * 0.02 + p.y * 0.01) * 0.4;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });

      // Ambient lighting pulses
      const pulse = Math.abs(Math.sin(frameCount * 0.04));
      ctx.fillStyle = activeTheme === "cyber" 
        ? `rgba(236, 72, 153, ${pulse * 0.03})` 
        : activeTheme === "cosmic"
        ? `rgba(217, 119, 6, ${pulse * 0.03})`
        : `rgba(6, 182, 212, ${pulse * 0.03})`;
      
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- HIGH QUALITY CARD RENDERING DIRECTLY ON CANVAS ---
      // This guarantees the player card is rendered in the actual recorded video stream!
      if (selectedPlayer) {
        ctx.save();
        
        // Center-aligned 160x240 card
        const cardW = 160;
        const cardH = 240;
        const cardX = (canvas.width - cardW) / 2;
        const cardY = (canvas.height - cardH) / 2 - 20;

        // Card glow ring effect
        ctx.shadowBlur = 15;
        if (activeTheme === "cosmic") ctx.shadowColor = "#f59e0b";
        else if (activeTheme === "cyber") ctx.shadowColor = "#ec4899";
        else if (activeTheme === "ice") ctx.shadowColor = "#06b6d4";
        else ctx.shadowColor = "#8b5cf6";

        // Rounded rect card container path
        ctx.beginPath();
        
        // Custom rounded rect support
        ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 20) : ctx.rect(cardX, cardY, cardW, cardH);
        
        // Background card gradient based on chosen theme
        let cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
        if (activeTheme === "cosmic") {
          cardGrad.addColorStop(0, "#2c1c02");
          cardGrad.addColorStop(0.5, "#0f0801");
          cardGrad.addColorStop(1, "#000000");
          ctx.strokeStyle = "#fbbf24";
        } else if (activeTheme === "cyber") {
          cardGrad.addColorStop(0, "#1d0728");
          cardGrad.addColorStop(0.5, "#07020a");
          cardGrad.addColorStop(1, "#000000");
          ctx.strokeStyle = "#ec4899";
        } else if (activeTheme === "ice") {
          cardGrad.addColorStop(0, "#082736");
          cardGrad.addColorStop(0.5, "#020f18");
          cardGrad.addColorStop(1, "#000000");
          ctx.strokeStyle = "#06b6d4";
        } else {
          cardGrad.addColorStop(0, "#130524");
          cardGrad.addColorStop(0.6, "#030107");
          cardGrad.addColorStop(1, "#000000");
          ctx.strokeStyle = "#a78bfa";
        }

        ctx.fillStyle = cardGrad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.shadowBlur = 0; // reset shadow for text

        // Player position & Rating
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(selectedPlayer.position, cardX + 16, cardY + 28);

        ctx.textAlign = "right";
        ctx.fillStyle = activeTheme === "cosmic" ? "#fbbf24" : "#ffffff";
        ctx.fillText(`OVR ${selectedPlayer.rating}`, cardX + cardW - 16, cardY + 28);

        // Player Avatar background circle
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.beginPath();
        ctx.arc(cardX + cardW / 2, cardY + 80, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.stroke();

        // Player Avatar Emoji
        ctx.font = "36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(selectedPlayer.avatar, cardX + cardW / 2, cardY + 92);

        // Name text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(selectedPlayer.name.toUpperCase(), cardX + cardW / 2, cardY + 140);

        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.font = "bold 8px sans-serif";
        ctx.fillText(selectedPlayer.club.toUpperCase(), cardX + cardW / 2, cardY + 154);

        // Stats divider
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + 20, cardY + 168);
        ctx.lineTo(cardX + cardW - 20, cardY + 168);
        ctx.stroke();

        // Stats attributes
        ctx.font = "bold 8px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillText("PHY", cardX + 45, cardY + 185);
        ctx.fillText("VIT", cardX + cardW - 45, cardY + 185);

        ctx.font = "bold 12px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(selectedPlayer.stats.physicality.toString(), cardX + 45, cardY + 202);
        ctx.fillText(selectedPlayer.stats.speed.toString(), cardX + cardW - 45, cardY + 202);

        // Prestige bottom label
        ctx.fillStyle = activeTheme === "cosmic" ? "#fbbf24" : "#a78bfa";
        ctx.font = "extrabold 8px sans-serif";
        ctx.fillText("🛡️ LEGEND CLUB", cardX + cardW / 2, cardY + cardH - 15);

        ctx.restore();
      }

      // Add a cool animated banner overlay inside the canvas
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("@PocketManagerClub ⚽", canvas.width / 2, canvas.height - 50);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 7px monospace";
      ctx.fillText(caption.slice(0, 45), canvas.width / 2, canvas.height - 35);
      ctx.fillText("#efootball #pocketmanager #fifa #phonk", canvas.width / 2, canvas.height - 22);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [activeTheme, isPlaying, selectedPlayer, caption]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  // --- AUTOMATED VIRAL VIDEO GENERATOR CORE ENGINE ---
  const handleExportVideo = () => {
    if (isRecording) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Force animation and music to play for rendering
    setIsPlaying(true);
    setIsAudioEnabled(true);
    setIsRecording(true);
    setRecordProgress(0);

    // Initialize recording buffers
    const recordedChunks: BlobPart[] = [];
    
    // Capture 30 FPS video stream from the canvas
    const videoStream = canvas.captureStream(30);
    const tracks = [...videoStream.getVideoTracks()];

    // Add high quality real-time synthesized audio tracks if available!
    if (recAudioDestRef.current) {
      const audioTracks = recAudioDestRef.current.stream.getAudioTracks();
      tracks.push(...audioTracks);
    }

    const combinedStream = new MediaStream(tracks);

    // Select suitable format
    let options = { mimeType: "video/webm;codecs=vp9,opus" };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: "video/webm" };
    }

    try {
      const mediaRecorder = new MediaRecorder(combinedStream, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Compile recorded chunks into standard WebM video
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);

        // Programmatically trigger video download
        const a = document.createElement("a");
        a.href = videoURL;
        a.download = `PocketManager_TikTok_${selectedPlayer?.name || "ViralEdit"}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setIsRecording(false);
        setRecordProgress(0);
      };

      // Record for exactly 6 seconds
      mediaRecorder.start();

      let currentSec = 0;
      const interval = setInterval(() => {
        currentSec += 1;
        setRecordProgress(currentSec);
        if (currentSec >= 6) {
          clearInterval(interval);
          mediaRecorder.stop();
        }
      }, 1000);

    } catch (err) {
      console.error("Recording error: ", err);
      alert("L'enregistrement vidéo n'est pas entièrement supporté sur votre navigateur actuel. Utilisez le guide d'enregistrement d'écran standard ci-dessous.");
      setIsRecording(false);
    }
  };

  return (
    <div className="p-4 space-y-4 select-none">
      
      {/* Studio Header Card */}
      <div className="bg-gradient-to-tr from-rose-600 via-violet-600 to-indigo-700 p-4 rounded-3xl text-white shadow-lg shadow-violet-500/10">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-rose-300 animate-pulse" />
          <h3 className="font-extrabold tracking-tight text-sm">TikTok Promo Video Studio 📱</h3>
        </div>
        <p className="text-[11px] text-rose-100 mt-1 leading-relaxed">
          Exposez votre effectif de rêve et vos joueurs légendaires sur TikTok ! Concevez un edit vidéo 9:16 stylisé avec de superbes filtres visuels et une bande-son entraînante.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* VIEWPORT COLUMN: The Interactive 9:16 Video Player Preview */}
        <div className="flex flex-col items-center justify-center bg-slate-900/40 p-3 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-inner">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Prévisualisation TikTok (9:16)
          </span>

          {/* Phone Mockup Frame */}
          <div 
            id="tiktok-phone-mockup"
            className="relative w-[280px] h-[500px] bg-black rounded-[36px] overflow-hidden border-[6px] border-slate-950 shadow-2xl flex flex-col justify-between"
          >
            {/* Top camera pill notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-1.5" />
            </div>

            {/* Simulated interactive video background canvas */}
            <canvas
              ref={canvasRef}
              width={280}
              height={500}
              className="absolute inset-0 z-0"
            />

            {/* Recording Progress HUD Overlay */}
            {isRecording && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center z-30 p-4 text-center">
                <FileVideo className="w-12 h-12 text-rose-500 animate-bounce mb-3" />
                <span className="text-xs font-black uppercase text-white tracking-widest">Enregistrement Viral en cours</span>
                <p className="text-[10px] text-slate-400 mt-1">Génération de la vidéo haute résolution...</p>
                
                {/* Visual Progress Bar */}
                <div className="w-32 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 transition-all duration-300" 
                    style={{ width: `${(recordProgress / 6) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-rose-400 font-mono font-bold mt-2">{recordProgress}s / 6s</span>
              </div>
            )}

            {/* TikTok Watermark Overlay */}
            <div className="absolute top-12 left-4 z-15 select-none opacity-80 flex items-center gap-1">
              <span className="text-white text-[10px] font-black tracking-tighter drop-shadow-md">
                🎵 eFootball Pocket
              </span>
            </div>

            {/* TikTok User HUD Overlay elements on the right & bottom */}
            <div className="absolute right-3.5 bottom-20 flex flex-col items-center gap-3.5 z-15 text-white select-none">
              
              {/* Creator Profile Avatar */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full border border-white bg-violet-600 flex items-center justify-center text-sm font-bold shadow-md">
                  🎮
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-black">
                  +
                </div>
              </div>

              {/* Heart Likes */}
              <div className="flex flex-col items-center">
                <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform text-rose-500 text-base shadow-sm">
                  ❤️
                </button>
                <span className="text-[8px] font-bold mt-0.5 drop-shadow-md">{(likes / 1000).toFixed(1)}k</span>
              </div>

              {/* Comments */}
              <div className="flex flex-col items-center">
                <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform text-slate-100 text-base shadow-sm">
                  💬
                </button>
                <span className="text-[8px] font-bold mt-0.5 drop-shadow-md">{comments}</span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center">
                <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-sky-400 text-base shadow-sm">
                  🔗
                </button>
                <span className="text-[8px] font-bold mt-0.5 drop-shadow-md">Share</span>
              </div>

              {/* Rotating sound vinyl */}
              <div className={`w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-750 flex items-center justify-center ${
                isPlaying ? "animate-spin" : ""
              }`}>
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
              </div>

            </div>

            {/* Bottom info banner details */}
            <div className="p-4 bg-gradient-to-t from-black/90 to-transparent z-10 space-y-1.5 text-white text-left select-none">
              <span className="text-[10px] font-bold text-slate-200">@PocketManagerClub ⚽</span>
              <p className="text-[9px] text-slate-300 leading-normal font-sans tracking-wide">
                {caption} <span className="text-sky-400 font-bold">#efootball #pocketmanager #fifa #drill</span>
              </p>
              
              {/* Soundtrack title */}
              <div className="flex items-center gap-1.5 text-[8px] text-yellow-400 font-mono">
                <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                <span className="truncate max-w-[150px]">Son original - {soundtrack.toUpperCase()} PHONK BEAT</span>
              </div>
            </div>

          </div>

          {/* Quick controls bar below phone */}
          <div className="mt-4 flex items-center gap-2.5">
            <button
              onClick={handleTogglePlay}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Animer</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleAudio}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isAudioEnabled 
                  ? "bg-rose-500 text-white" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Son Actif</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>Activer Son 🔊</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* CUSTOMIZATION COLUMN: Options & Guides */}
        <div className="space-y-4">
          
          {/* Section 0: AUTO GENERATE DOWNLOAD TRIGGER BUTTON */}
          <div className="bg-gradient-to-tr from-rose-500 via-pink-600 to-violet-600 p-4 rounded-2xl shadow-md text-white text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5">
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="font-black text-xs uppercase tracking-tight">Exportation Vidéo Directe</span>
            </div>
            
            <p className="text-[10px] text-rose-100 leading-normal max-w-xs mx-auto">
              Cliquez ci-dessous pour lancer l'enregistrement et télécharger automatiquement votre vidéo de 6 secondes avec la bande-son active !
            </p>

            <button
              onClick={handleExportVideo}
              disabled={isRecording}
              className="w-full py-3 bg-white text-rose-600 hover:bg-slate-100 disabled:bg-rose-800 disabled:text-rose-300 text-xs font-black rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isRecording ? "Enregistrement..." : "Générer la Vidéo TikTok Virale 🚀"}</span>
            </button>
          </div>

          {/* Section 1: Selector Player */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
              1. Choisissez votre Vedette 🌟
            </span>
            <select
              value={selectedPlayer?.id || ""}
              onChange={(e) => {
                const found = myPlayers.find((p) => p.id === e.target.value);
                if (found) setSelectedPlayer(found);
              }}
              className="w-full bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
            >
              {myPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (OVR: {p.rating} - {p.position})
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Visual Theme Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
              2. Ambiance Visuelle & Filtre 🎨
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "cosmic", label: "🔥 Or Légendaire" },
                { id: "cyber", label: "⚡ Néon Cyberpunk" },
                { id: "ice", label: "💎 Saphir d'Élite" },
                { id: "drill", label: "🌌 Drill Nocturne" }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id as VideoTheme)}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all truncate text-left cursor-pointer ${
                    activeTheme === theme.id
                      ? "bg-slate-900 border-slate-950 text-yellow-400 dark:bg-white dark:border-white dark:text-slate-900"
                      : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Soundtrack Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
              3. Style Musical (Synthétiseur Rythmique) 🎹
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "phonk", label: "⚡ Brazilian Phonk" },
                { id: "hype", label: "🔥 Drill Trap Drop" },
                { id: "epic", label: "🛡️ Orchestral Épique" },
                { id: "lofi", label: "☕ Lo-Fi Détendu" }
              ].map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSoundtrack(track.id as SoundtrackType)}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all truncate text-left cursor-pointer ${
                    soundtrack === track.id
                      ? "bg-slate-900 border-slate-950 text-yellow-400 dark:bg-white dark:border-white dark:text-slate-900"
                      : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                  }`}
                >
                  🎧 {track.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Customize Caption */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">
              4. Légende / Caption de la vidéo ✍️
            </span>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Saisissez une description accrocheuse..."
              className="w-full bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
            />
          </div>

          {/* Section 4.5: Viral Script & Ideas Generator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs space-y-3">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-violet-650 dark:text-violet-400 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
              IDÉES DE CONCEPTS & SCRIPTS VIRAUX TIKTOK
            </span>
            
            <p className="text-[10px] text-slate-500 leading-normal">
              Utilisez un de ces concepts de vidéos ultra-populaires pour percer l'algorithme de TikTok avec votre joueur {selectedPlayer?.name} :
            </p>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800 text-[10px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight">🎬 Concept 1: Le Pack Opening Choquant</span>
                  <span className="bg-red-500 text-white text-[8px] px-1 rounded-sm font-bold">VIRAL 🔥</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  "J'ai dépensé toutes mes pièces d'or... et j'ai eu ça ! 😱"
                </p>
                <div className="text-slate-500 italic">
                  **Action :** Filmez-vous en train de faire semblant de cliquer sur "Acheter Pack" puis montrez cette carte {selectedPlayer?.name} s'animer avec la musique Phonk à fond !
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800 text-[10px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight">🎬 Concept 2: Débat Statistique</span>
                  <span className="bg-violet-550 text-white text-[8px] px-1 rounded-sm font-bold">DÉBAT 💬</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  "Est-ce que {selectedPlayer?.name} est sous-coté avec {selectedPlayer?.rating} OVR ? 🤔"
                </p>
                <div className="text-slate-500 italic">
                  **Action :** Posez la question à votre communauté. Demandez-leur en commentaire s'ils préfèrent {selectedPlayer?.name} ou une autre star !
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800 text-[10px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight">🎬 Concept 3: L'Edit Pro "Drill & Phonk"</span>
                  <span className="bg-cyan-500 text-white text-[8px] px-1 rounded-sm font-bold">ESTHÉTIQUE 💎</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  "Niveau Physique: {selectedPlayer?.stats.physicality} | Vitesse: {selectedPlayer?.stats.speed} ⚡"
                </p>
                <div className="text-slate-500 italic">
                  **Action :** Activez le filtre "Néon Cyberpunk" ou "Drill Nocturne", activez le son, et laissez la carte pulser en rythme avec les basses.
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Step by Step Guide & Export Action */}
          <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-4 rounded-2xl border border-slate-850 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h4 className="font-extrabold text-xs">Comment Exporter & Publier ?</h4>
            </div>
            
            <p className="text-[10px] text-slate-350 leading-relaxed font-normal">
              Puisque vous jouez dans une application web, l'outil le plus simple et professionnel consiste à **enregistrer votre écran** pendant l'animation pour un rendu de haute qualité avec le son !
            </p>

            <button
              onClick={() => setShowRecordingGuide(!showRecordingGuide)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-white text-[11px] font-bold rounded-lg border border-slate-750 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showRecordingGuide ? "Masquer le tutoriel" : "Voir les étapes d'enregistrement 📲"}</span>
            </button>

            {showRecordingGuide && (
              <div className="text-[10px] text-slate-300 space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-850/60 leading-normal font-normal">
                <p>📱 **Sur iPhone / iPad :**</p>
                <ol className="list-decimal list-inside ml-1 space-y-1">
                  <li>Glissez vers le bas pour ouvrir le Centre de Contrôle.</li>
                  <li>Appuyez sur l'icône ronde **Enregistrement d'écran**.</li>
                  <li>Activez le micro si vous souhaitez parler, puis lancez le décompte !</li>
                </ol>
                <p className="pt-1">🤖 **Sur Android (Samsung, Xiaomi, Pixel) :**</p>
                <ol className="list-decimal list-inside ml-1 space-y-1">
                  <li>Glissez deux fois vers le bas pour afficher les raccourcis.</li>
                  <li>Recherchez le bouton **Enregistreur d'écran**.</li>
                  <li>Configurez les sons sur "Médias" pour capturer la bande-son de l'application !</li>
                </ol>
                <p className="pt-1">💻 **Sur Ordinateur (Windows / Mac) :**</p>
                <ol className="list-decimal list-inside ml-1 space-y-1">
                  <li>Windows: Appuyez sur <kbd className="bg-slate-800 px-1 py-0.5 rounded">Win</kbd> + <kbd className="bg-slate-800 px-1 py-0.5 rounded">Alt</kbd> + <kbd className="bg-slate-800 px-1 py-0.5 rounded">R</kbd> pour enregistrer instantanément avec la Game Bar Xbox.</li>
                  <li>Mac: Appuyez sur <kbd className="bg-slate-800 px-1 py-0.5 rounded">Shift</kbd> + <kbd className="bg-slate-800 px-1 py-0.5 rounded">Cmd</kbd> + <kbd className="bg-slate-800 px-1 py-0.5 rounded">5</kbd>.</li>
                </ol>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
