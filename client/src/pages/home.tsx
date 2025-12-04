import { Link } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import logo from "@assets/image_1764891451094.png";

export default function Home() {
  return (
    <BoothShell>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-zinc-900/50">
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 flex flex-col items-center"
        >
          <div className="relative w-64 md:w-80 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
             <img 
               src={logo} 
               alt="Billy's Ayr Lanes" 
               className="w-full h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
             />
          </div>
          
          <p className="font-mono text-sm text-muted-foreground tracking-widest mt-8">
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
