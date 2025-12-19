import { useLocation } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion } from "framer-motion";
import { Smartphone, Nfc, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSwiping, setIsSwiping] = useState(false);
  const [photoType, setPhotoType] = useState<"bw" | "color">("bw");

  const handleTap = () => {
    if (!email) return; // Simple validation
    localStorage.setItem("photo_type", photoType);
    localStorage.setItem("user_email", email);
    setIsSwiping(true);
    setTimeout(() => {
      setLocation("/booth");
    }, 2000);
  };

  return (
    <BoothShell>
      <div className="flex-1 flex flex-col p-8 bg-zinc-900/50">
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display text-accent uppercase tracking-wider">Details</h2>
            <p className="font-mono text-xs text-muted-foreground">ENTER EMAIL & TAP TO PAY</p>
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
              <div className="relative h-48 bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-600 flex flex-col items-center justify-center overflow-hidden group cursor-pointer" onClick={handleTap}>
                
                {isSwiping ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-accent font-display text-2xl uppercase flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
                    Processing...
                  </motion.div>
                ) : (
                  <>
                    <div className="relative">
                      <Nfc className="w-20 h-20 text-zinc-500 mb-4 group-hover:text-white transition-colors animate-pulse" />
                      <Smartphone className="w-12 h-12 text-zinc-600 absolute bottom-0 -right-4 bg-zinc-800 rounded-full p-1 border-2 border-zinc-800 group-hover:text-zinc-300 transition-colors" />
                    </div>
                    <p className="font-mono text-xs text-zinc-400 group-hover:text-white transition-colors uppercase tracking-widest">TAP CARD OR PHONE HERE</p>
                    <p className="font-mono text-[10px] text-zinc-600 mt-2">$5.00 CHARGE</p>
                  </>
                )}

                {/* NFC Wave Animation */}
                {!isSwiping && (
                  <motion.div 
                    className="absolute inset-0 border-4 border-accent/20 rounded-lg"
                    animate={{ scale: [1, 1.05, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
           <div className="flex gap-2 items-center">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-mono text-zinc-500">NFC READER ACTIVE</span>
           </div>
           <div className="flex gap-2">
             <span className="text-[10px] font-mono text-zinc-600">VISA • MC • AMEX • APPLE PAY</span>
           </div>
        </div>
      </div>
    </BoothShell>
  );
}
