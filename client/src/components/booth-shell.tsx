import React from "react";
import { motion } from "framer-motion";
import curtainTexture from "@assets/generated_images/red_velvet_curtain_texture.png";

interface BoothShellProps {
  children: React.ReactNode;
  className?: string;
}

export function BoothShell({ children, className = "" }: BoothShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Curtain Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(${curtainTexture})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 z-0 bg-radial-gradient pointer-events-none" style={{ background: "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 90%)" }} />

      {/* Machine Frame */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative z-10 w-full max-w-md bg-card border-8 border-muted shadow-2xl rounded-lg overflow-hidden flex flex-col box-glow ${className}`}
        style={{ minHeight: "600px" }}
      >
        {/* Top "Sign" Area */}
        <div className="bg-zinc-900 p-4 border-b-4 border-muted flex justify-between items-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-900 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-yellow-900" />
          </div>
          <h1 className="text-muted-foreground text-xs font-display tracking-[0.2em]">PHOTO-MATIC 2000</h1>
          <div className="w-8 flex flex-col gap-1">
             <div className="h-[2px] w-full bg-zinc-800" />
             <div className="h-[2px] w-full bg-zinc-800" />
             <div className="h-[2px] w-full bg-zinc-800" />
          </div>
        </div>

        {/* Main Screen Content */}
        <div className="flex-1 relative flex flex-col">
          {children}
        </div>

        {/* Bottom "Slot" Area */}
        <div className="bg-zinc-900 p-6 border-t-4 border-muted relative">
          <div className="w-32 h-4 bg-black rounded-full mx-auto border-b border-zinc-700 shadow-inner" />
          <p className="text-center text-[10px] text-zinc-600 mt-2 font-mono">NO REFUNDS • 4 PHOTOS • $5.00</p>
        </div>
      </motion.div>
    </div>
  );
}
