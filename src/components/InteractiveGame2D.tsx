import React, { useEffect, useRef, useState } from "react";
import { Trophy, ArrowLeft, RotateCcw, Zap } from "lucide-react";

interface InteractiveGame2DProps {
  userTeamStrength: number;
  onRewardGranted: (gp: number, coins: number) => void;
  onClose: () => void;
}

export default function InteractiveGame2D({ userTeamStrength, onRewardGranted, onClose }: InteractiveGame2DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<"ready" | "playing" | "paused" | "gameover">("ready");
  
  // Scoreboard
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds match

  // Joystick & Input Touch State
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [joystickStart, setJoystickStart] = useState({ x: 0, y: 0 });

  // References for game loop to avoid state re-render lags
  const userScoreRef = useRef(0);
  const opponentScoreRef = useRef(0);
  const timeLeftRef = useRef(60);

  // Entities state
  const playerRef = useRef({
    x: 180,
    y: 350,
    vx: 0,
    vy: 0,
    radius: 12,
    speed: 3.5 + (userTeamStrength - 70) * 0.03, // Speed depends slightly on team strength
    color: "#3b82f6",
    name: "Vous"
  });

  const opponentRef = useRef({
    x: 180,
    y: 150,
    vx: 0,
    vy: 0,
    radius: 12,
    speed: 3.2,
    color: "#ef4444",
    name: "Adversaire"
  });

  const ballRef = useRef({
    x: 180,
    y: 250,
    vx: 0,
    vy: 0,
    radius: 8,
    friction: 0.98,
    color: "#ffffff"
  });

  // Target goals geometry
  const pitchWidth = 360;
  const pitchHeight = 480;
  const goalWidth = 100;
  const goalDepth = 15;

  // Keyboard state
  const keysPressed = useRef<Record<string, boolean>>({});

  // Reset positions helper (after goal or kickoff)
  const resetPositions = (starter: "user" | "opponent" | "center") => {
    playerRef.current.x = pitchWidth / 2;
    playerRef.current.y = pitchHeight - 100;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;

    opponentRef.current.x = pitchWidth / 2;
    opponentRef.current.y = 100;
    opponentRef.current.vx = 0;
    opponentRef.current.vy = 0;

    ballRef.current.x = pitchWidth / 2;
    ballRef.current.y = pitchHeight / 2;
    ballRef.current.vx = 0;
    ballRef.current.vy = 0;
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === " " || e.key.toLowerCase() === "z") {
        // Trigger shoot
        handleShootBall();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        clearInterval(timer);
        handleEndGame();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleStartGame = () => {
    userScoreRef.current = 0;
    opponentScoreRef.current = 0;
    timeLeftRef.current = 60;
    setUserScore(0);
    setOpponentScore(0);
    setTimeLeft(60);
    resetPositions("center");
    setGameState("playing");
  };

  const handleEndGame = () => {
    setGameState("gameover");
    
    // Give rewards
    let gpReward = 5000;
    let coinsReward = 10;

    if (userScoreRef.current > opponentScoreRef.current) {
      gpReward = 20000; // Win reward
      coinsReward = 50;
    } else if (userScoreRef.current === opponentScoreRef.current) {
      gpReward = 10000; // Draw reward
      coinsReward = 20;
    }

    onRewardGranted(gpReward, coinsReward);
  };

  // Ball Kick/Shoot action
  const handleShootBall = () => {
    if (gameState !== "playing") return;

    // Check distance between player and ball
    const dx = ballRef.current.x - playerRef.current.x;
    const dy = ballRef.current.y - playerRef.current.y;
    const distance = Math.hypot(dx, dy);

    // If close enough to ball, kick it towards the opponent's goal (top)
    if (distance < playerRef.current.radius + ballRef.current.radius + 15) {
      // Aim at opponent goal
      const targetX = pitchWidth / 2;
      const targetY = 10; // opponent goal line
      
      const angle = Math.atan2(targetY - ballRef.current.y, targetX - ballRef.current.x);
      const force = 12;

      ballRef.current.vx = Math.cos(angle) * force;
      ballRef.current.vy = Math.sin(angle) * force;
    }
  };

  // Touch controls / virtual D-pad joystick logic
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setJoystickActive(true);
    setJoystickStart({ x: touch.clientX, y: touch.clientY });
    setJoystickPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickActive) return;
    const touch = e.touches[0];
    
    // Calculate vector delta
    const dx = touch.clientX - joystickStart.x;
    const dy = touch.clientY - joystickStart.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 40; // max joystick drag

    if (dist > maxRadius) {
      const angle = Math.atan2(dy, dx);
      setJoystickPos({
        x: joystickStart.x + Math.cos(angle) * maxRadius,
        y: joystickStart.y + Math.sin(angle) * maxRadius
      });
    } else {
      setJoystickPos({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    setJoystickStart({ x: 0, y: 0 });
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const updatePhysics = () => {
      if (gameState !== "playing") return;

      const player = playerRef.current;
      const opponent = opponentRef.current;
      const ball = ballRef.current;

      // --- PLAYER CONTROLS (Joystick vs Keyboard) ---
      let moveX = 0;
      let moveY = 0;

      // Keyboard
      if (keysPressed.current["arrowup"] || keysPressed.current["w"]) moveY = -1;
      if (keysPressed.current["arrowdown"] || keysPressed.current["s"]) moveY = 1;
      if (keysPressed.current["arrowleft"] || keysPressed.current["a"]) moveX = -1;
      if (keysPressed.current["arrowright"] || keysPressed.current["d"]) moveX = 1;

      // Virtual Joystick
      if (joystickActive) {
        const dx = joystickPos.x - joystickStart.x;
        const dy = joystickPos.y - joystickStart.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
          moveX = dx / dist;
          moveY = dy / dist;
        }
      }

      // Apply velocity
      player.vx = moveX * player.speed;
      player.vy = moveY * player.speed;

      player.x += player.vx;
      player.y += player.vy;

      // Boundaries for player
      player.x = Math.max(player.radius + 10, Math.min(pitchWidth - player.radius - 10, player.x));
      player.y = Math.max(player.radius + 10, Math.min(pitchHeight - player.radius - 10, player.y));


      // --- OPPONENT AI INTELLIGENCE ---
      // Simple behavior: run towards the ball if user is defending, or track ball towards goal
      const oSpeed = opponent.speed;
      const distToBallX = ball.x - opponent.x;
      const distToBallY = ball.y - opponent.y;
      const distToBall = Math.hypot(distToBallX, distToBallY);

      if (distToBall < 180) {
        // Chase ball
        opponent.vx = (distToBallX / distToBall) * oSpeed;
        opponent.vy = (distToBallY / distToBall) * oSpeed;
      } else {
        // Return to standard defense/goalkeeping zone
        const homeX = pitchWidth / 2;
        const homeY = 120;
        const dx = homeX - opponent.x;
        const dy = homeY - opponent.y;
        const distHome = Math.hypot(dx, dy);
        if (distHome > 10) {
          opponent.vx = (dx / distHome) * oSpeed;
          opponent.vy = (dy / distHome) * oSpeed;
        } else {
          opponent.vx = 0;
          opponent.vy = 0;
        }
      }

      opponent.x += opponent.vx;
      opponent.y += opponent.vy;

      // Boundaries for opponent
      opponent.x = Math.max(opponent.radius + 10, Math.min(pitchWidth - opponent.radius - 10, opponent.x));
      opponent.y = Math.max(opponent.radius + 10, Math.min(pitchHeight - opponent.radius - 10, opponent.y));


      // --- BALL PHYSICS ---
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Apply friction
      ball.vx *= ball.friction;
      ball.vy *= ball.friction;

      // Boundary rebounds
      if (ball.x - ball.radius < 10) {
        ball.x = ball.radius + 10;
        ball.vx *= -1;
      }
      if (ball.x + ball.radius > pitchWidth - 10) {
        ball.x = pitchWidth - ball.radius - 10;
        ball.vx *= -1;
      }

      // End pitch boundaries (considering Goals)
      const goalMinX = (pitchWidth - goalWidth) / 2;
      const goalMaxX = (pitchWidth + goalWidth) / 2;

      // Top Goal Line (Opponent's goal)
      if (ball.y - ball.radius < 10) {
        if (ball.x > goalMinX && ball.x < goalMaxX) {
          // GOAL FOR USER!
          userScoreRef.current += 1;
          setUserScore(userScoreRef.current);
          resetPositions("opponent");
          return;
        } else {
          ball.y = ball.radius + 10;
          ball.vy *= -1;
        }
      }

      // Bottom Goal Line (User's goal)
      if (ball.y + ball.radius > pitchHeight - 10) {
        if (ball.x > goalMinX && ball.x < goalMaxX) {
          // GOAL FOR OPPONENT!
          opponentScoreRef.current += 1;
          setOpponentScore(opponentScoreRef.current);
          resetPositions("user");
          return;
        } else {
          ball.y = pitchHeight - ball.radius - 10;
          ball.vy *= -1;
        }
      }


      // --- COLLISIONS ---
      // Player to Ball
      const pDx = ball.x - player.x;
      const pDy = ball.y - player.y;
      const pDist = Math.hypot(pDx, pDy);
      const minPDist = player.radius + ball.radius;

      if (pDist < minPDist) {
        // Push ball in direction of movement
        const pushForce = 1.3;
        ball.vx = (pDx / pDist) * (Math.abs(player.vx) + 1.2) * pushForce;
        ball.vy = (pDy / pDist) * (Math.abs(player.vy) + 1.2) * pushForce;
        // Move ball outside of player radius to avoid stickiness
        ball.x = player.x + (pDx / pDist) * minPDist;
        ball.y = player.y + (pDy / pDist) * minPDist;
      }

      // Opponent to Ball
      const oDx = ball.x - opponent.x;
      const oDy = ball.y - opponent.y;
      const oDist = Math.hypot(oDx, oDy);
      const minODist = opponent.radius + ball.radius;

      if (oDist < minODist) {
        // Kick ball away (Opponent attacks user's goal - bottom)
        const targetX = pitchWidth / 2;
        const targetY = pitchHeight - 10;
        const angle = Math.atan2(targetY - ball.y, targetX - ball.x);
        const force = 4.5;
        
        ball.vx = Math.cos(angle) * force + (Math.random() - 0.5) * 2;
        ball.vy = Math.sin(angle) * force;

        ball.x = opponent.x + (oDx / oDist) * minODist;
        ball.y = opponent.y + (oDy / oDist) * minODist;
      }
    };

    const drawGame = () => {
      ctx.clearRect(0, 0, pitchWidth, pitchHeight);

      // 1. Draw Field Background grass green lines
      ctx.fillStyle = "#047857";
      ctx.fillRect(0, 0, pitchWidth, pitchHeight);

      // Stripes
      ctx.fillStyle = "#065f46";
      for (let y = 0; y < pitchHeight; y += 40) {
        if ((y / 40) % 2 === 0) {
          ctx.fillRect(0, y, pitchWidth, 40);
        }
      }

      // Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;

      // Outer border
      ctx.strokeRect(10, 10, pitchWidth - 20, pitchHeight - 20);

      // Mid line & circle
      ctx.beginPath();
      ctx.moveTo(10, pitchHeight / 2);
      ctx.lineTo(pitchWidth - 10, pitchHeight / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pitchWidth / 2, pitchHeight / 2, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Penalty zones
      const goalMinX = (pitchWidth - goalWidth) / 2;
      
      // Top box
      ctx.strokeRect((pitchWidth - 160) / 2, 10, 160, 80);
      ctx.strokeRect((pitchWidth - 80) / 2, 10, 80, 30);
      
      // Bottom box
      ctx.strokeRect((pitchWidth - 160) / 2, pitchHeight - 90, 160, 80);
      ctx.strokeRect((pitchWidth - 80) / 2, pitchHeight - 40, 80, 30);

      // Goals (visual mesh rectangles)
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillRect(goalMinX, 0, goalWidth, 10);
      ctx.fillRect(goalMinX, pitchHeight - 10, goalWidth, 10);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(goalMinX, 0, goalWidth, 10);
      ctx.strokeRect(goalMinX, pitchHeight - 10, goalWidth, 10);

      // 2. Draw Entities
      const player = playerRef.current;
      const opponent = opponentRef.current;
      const ball = ballRef.current;

      // Draw Player (Blue)
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = player.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Player Number or name on head
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("VOUS", player.x, player.y + 3);

      // Draw Opponent (Red)
      ctx.beginPath();
      ctx.arc(opponent.x, opponent.y, opponent.radius, 0, Math.PI * 2);
      ctx.fillStyle = opponent.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("IA", opponent.x, opponent.y + 3);

      // Draw Ball (White with pattern)
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mini soccer pattern lines on the ball
      ctx.beginPath();
      ctx.moveTo(ball.x - 3, ball.y - 3);
      ctx.lineTo(ball.x + 3, ball.y + 3);
      ctx.moveTo(ball.x + 3, ball.y - 3);
      ctx.lineTo(ball.x - 3, ball.y + 3);
      ctx.stroke();
    };

    const loop = () => {
      updatePhysics();
      drawGame();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, joystickActive, joystickPos]);

  return (
    <div className="absolute inset-0 bg-slate-950 text-white flex flex-col z-40 select-none animate-fade-in overflow-hidden">
      
      {/* Top scoreboard and exit */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-blue-400 block font-bold">Dream Team</span>
            <span className="text-xl font-black font-mono">{userScore}</span>
          </div>
          <span className="text-slate-500 font-bold">:</span>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider text-red-400 block font-bold">Adversaire</span>
            <span className="text-xl font-black font-mono">{opponentScore}</span>
          </div>
        </div>

        <div className="bg-slate-850 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-yellow-400">
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Main interactive field block */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
        
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={pitchWidth}
          height={pitchHeight}
          className="rounded-2xl border-2 border-slate-800 max-h-full max-w-full shadow-2xl shadow-emerald-950/20"
        />

        {/* Start Game overlay */}
        {gameState === "ready" && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/20 mb-4 animate-bounce">
              🎮
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Match Réel Interactif</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-[240px] leading-relaxed">
              Contrôlez votre joueur, dribblez l'adversaire et tirez au but pour remporter le match et gagner des GP de prestige !
            </p>

            <div className="mt-5 space-y-2 text-[10px] text-slate-500 max-w-[200px]">
              <p>📱 Mobile: Utilisez le joystick virtuel et le bouton TIRER</p>
              <p>💻 PC: Flèches ou ZQSD pour vous déplacer, ESPACE pour tirer</p>
            </div>

            <button
              onClick={handleStartGame}
              className="mt-6 px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-violet-500/15 cursor-pointer"
            >
              Jouer le Match ⚽
            </button>
          </div>
        )}

        {/* Game Over reward summary overlay */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <Trophy className="w-14 h-14 text-yellow-400 animate-bounce mb-4" />
            
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Coup de sifflet final !</h2>
            
            <div className="my-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full max-w-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-1">Score Final</span>
              <p className="text-2xl font-black font-mono">
                Vous {userScore} - {opponentScore} IA
              </p>
              
              <p className="text-xs font-semibold text-yellow-400 mt-2.5">
                {userScore > opponentScore ? "VICTOIRE MAGNIFIQUE ! 🎉" : userScore === opponentScore ? "MATCH NUL COMPATIBLE ! ⚖️" : "DÉFAITE ENCOURAGEANTE ! 💪"}
              </p>
            </div>

            <div className="space-y-1.5 bg-violet-950/20 border border-violet-900/40 p-3 rounded-xl w-full max-w-xs text-left mb-6">
              <span className="text-[8px] uppercase tracking-wider font-bold text-violet-400">Bonus de prestige octroyés :</span>
              <div className="flex justify-between text-xs font-bold font-mono">
                <span>🪙 GP Accordés:</span>
                <span className="text-yellow-400">+{userScore > opponentScore ? "20 000" : userScore === opponentScore ? "10 000" : "5 000"} GP</span>
              </div>
              <div className="flex justify-between text-xs font-bold font-mono">
                <span>💎 MyClub Coins:</span>
                <span className="text-cyan-400">+{userScore > opponentScore ? "50" : userScore === opponentScore ? "20" : "10"}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-xs py-3 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-transform active:scale-97 cursor-pointer"
            >
              Retourner au Hub Tactique 🏡
            </button>
          </div>
        )}

      </div>

      {/* Interactive Controller HUD Panel (Virtual Touchpad) */}
      {gameState === "playing" && (
        <div 
          className="h-32 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between px-6 py-4 shrink-0 relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Virtual Joystick Touch Area left */}
          <div className="relative w-24 h-24 bg-slate-800/45 rounded-full border border-slate-700/60 flex items-center justify-center">
            {/* Outer visual circle */}
            <div className="w-16 h-16 rounded-full border border-dashed border-slate-600/30" />
            
            {/* Dynamic thumb stick representation */}
            <div 
              style={{
                transform: joystickActive 
                  ? `translate(${((joystickPos.x - joystickStart.x) / Math.hypot(joystickPos.x - joystickStart.x, joystickPos.y - joystickStart.y)) * Math.min(25, Math.hypot(joystickPos.x - joystickStart.x, joystickPos.y - joystickStart.y))}px, ${((joystickPos.y - joystickStart.y) / Math.hypot(joystickPos.x - joystickStart.x, joystickPos.y - joystickStart.y)) * Math.min(25, Math.hypot(joystickPos.x - joystickStart.x, joystickPos.y - joystickStart.y))}px)`
                  : "translate(0, 0)"
              }}
              className="absolute w-10 h-10 bg-gradient-to-tr from-slate-600 to-slate-400 rounded-full shadow-lg flex items-center justify-center transition-all duration-75"
            >
              <div className="w-4 h-4 bg-slate-800 rounded-full" />
            </div>
          </div>

          {/* Guide tip label */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1 text-[8px] text-slate-500 uppercase tracking-widest pointer-events-none">
            Utilisez les flèches ou glissez ici
          </div>

          {/* Action Action Kick Button right */}
          <button
            id="shoot-button-virtual"
            onClick={handleShootBall}
            onTouchStart={handleShootBall}
            className="w-18 h-18 bg-yellow-500 active:bg-yellow-600 text-slate-950 font-black rounded-full flex flex-col items-center justify-center shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
          >
            <Zap className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[8px] uppercase tracking-wider font-black mt-0.5">Tirer</span>
          </button>
        </div>
      )}

    </div>
  );
}
