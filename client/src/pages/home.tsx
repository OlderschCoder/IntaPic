import { Link } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion } from "framer-motion";
import { Camera, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <BoothShell>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-zinc-900/50">
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="inline-block p-6 rounded-full border-4 border-accent/50 bg-accent/10 mb-4 box-glow">
            <Camera className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display text-foreground text-glow uppercase leading-none">
            Photo<br/>Booth
          </h1>
          <p className="font-mono text-sm text-muted-foreground tracking-widest">
            4 SPONTANEOUS POSES • B&W FILM
          </p>
        </motion.div>

        <Link href="/payment">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-primary text-white font-display text-xl tracking-widest uppercase rounded-sm hover:bg-primary/90 transition-colors w-full max-w-xs overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
          </motion.button>
        </Link>

        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-[10px] text-zinc-500 font-mono animate-pulse">
            TOUCH SCREEN TO BEGIN
          </p>
        </div>
      </div>
    </BoothShell>
  );
}
