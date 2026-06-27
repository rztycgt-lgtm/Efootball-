import React, { useState, useEffect } from "react";
import { Wifi, Battery, ShieldAlert as Signal } from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="applet-viewport-root" className="min-h-screen bg-slate-900 flex items-center justify-center p-0 md:p-8 font-sans transition-colors duration-300">
      {/* Decorative desktop-only ambient glow blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none hidden md:block" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none hidden md:block" />

      {/* Main Container: Mobile phone mockup on desktop, fluid on mobile */}
      <div 
        id="phone-mockup" 
        className="relative w-full max-w-md h-screen md:h-[840px] bg-slate-50 dark:bg-slate-950 md:rounded-[40px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] md:border-[10px] md:border-slate-800 flex flex-col overflow-hidden transition-all duration-300"
      >
        {/* Status Bar */}
        <div 
          id="phone-status-bar" 
          className="h-10 px-6 pt-3 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 select-none z-30"
        >
          <span>{time || "08:30"}</span>
          
          {/* Dynamic Notch Mock */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-2 w-28 h-5 bg-slate-800 rounded-full z-40 shadow-inner" />
          
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <Battery className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Dynamic Content (Fills viewport) */}
        <div id="phone-screen-content" className="flex-1 flex flex-col overflow-hidden relative z-10">
          {children}
        </div>

        {/* Simulated iOS Indicator Bar */}
        <div className="hidden md:block h-6 pb-2.5 flex items-center justify-center bg-transparent z-40 select-none">
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
