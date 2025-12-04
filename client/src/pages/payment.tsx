import { useLocation } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSwiping, setIsSwiping] = useState(false);
  const [photoType, setPhotoType] = useState<"bw" | "color">("bw");

  const handleSwipe = () => {
    if (!email) return; // Simple validation
    localStorage.setItem("photo_type", photoType);
    setIsSwiping(true);
    setTimeout(() => {
      setLocation("/booth");
    }, 1500);
  };

  return (
    <BoothShell>
      <div className="flex-1 flex flex-col p-8 bg-zinc-900/50">
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display text-accent uppercase tracking-wider">Details</h2>
            <p className="font-mono text-xs text-muted-foreground">ENTER EMAIL & SWIPE CARD</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs uppercase text-muted-foreground">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="YOU@EXAMPLE.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-zinc-700 font-mono text-lg h-12 focus:border-accent focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase text-muted-foreground">Photo Style</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPhotoType("bw")}
                  className={`h-12 border-2 font-display uppercase tracking-wider transition-all ${
                    photoType === "bw" 
                      ? "bg-white text-black border-white" 
                      : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  B&W Film
                </button>
                <button
                  onClick={() => setPhotoType("color")}
                  className={`h-12 border-2 font-display uppercase tracking-wider transition-all ${
                    photoType === "color" 
                      ? "bg-accent text-black border-accent" 
                      : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  Color
                </button>
              </div>
            </div>

            <div className="pt-4">
              <div className="relative h-48 bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-600 flex flex-col items-center justify-center overflow-hidden group cursor-pointer" onClick={handleSwipe}>
                
                {isSwiping ? (
                  <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-accent font-display text-2xl uppercase"
                  >
                    Authorizing...
                  </motion.div>
                ) : (
                  <>
                    <CreditCard className="w-16 h-16 text-zinc-500 mb-4 group-hover:text-white transition-colors" />
                    <p className="font-mono text-xs text-zinc-400 group-hover:text-white transition-colors">TAP TO SWIPE CARD</p>
                    <p className="font-mono text-[10px] text-zinc-600 mt-2">$5.00 CHARGE</p>
                  </>
                )}

                {/* Swipe Animation Line */}
                <motion.div 
                  className="absolute top-0 bottom-0 w-1 bg-accent/50"
                  animate={isSwiping ? { left: ["0%", "100%"] } : { left: "-10%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
           <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-mono text-zinc-500">READER READY</span>
           </div>
        </div>
      </div>
    </BoothShell>
  );
}
