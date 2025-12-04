import { useLocation } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Result() {
  const [, setLocation] = useLocation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPrinting, setIsPrinting] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("booth_photos");
    if (stored) {
      setPhotos(JSON.parse(stored));
    }
    
    // Simulate printing time
    setTimeout(() => setIsPrinting(false), 3000);
  }, []);

  const handleRetake = () => {
    setLocation("/");
  };

  return (
    <BoothShell>
      <div className="flex-1 flex flex-col items-center p-4 bg-zinc-900/50 overflow-hidden">
        
        <div className="flex-1 w-full flex items-center justify-center relative perspective-1000">
          {isPrinting ? (
             <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                <h2 className="text-xl font-display text-white animate-pulse">DEVELOPING FILM...</h2>
                <p className="font-mono text-xs text-zinc-500">PLEASE WAIT</p>
             </div>
          ) : (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="relative bg-white p-2 pb-8 shadow-2xl rotate-1 max-h-[500px] overflow-y-auto no-scrollbar"
              style={{ width: "140px" }} // Approx strip width
            >
              {/* Strip Header */}
              <div className="text-center py-2 border-b-2 border-black mb-2">
                <h3 className="font-display text-black text-lg leading-none">PHOTO<br/>MATIC</h3>
                <p className="text-[8px] font-mono text-black">DEC 04 2025</p>
              </div>

              {/* Photos */}
              <div className="space-y-2">
                {photos.map((src, i) => (
                  <div key={i} className="aspect-[4/3] bg-zinc-200 border border-zinc-300 p-1">
                    <img src={src} alt={`Pose ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Strip Footer */}
              <div className="mt-4 text-center">
                 <p className="font-mono text-[8px] text-black/50">ID: #8X92-A</p>
              </div>
            </motion.div>
          )}
        </div>

        {!isPrinting && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm space-y-4 mt-6"
            >
                <div className="bg-green-500/10 border border-green-500/50 p-4 rounded flex items-center gap-3">
                    <div className="bg-green-500 p-1 rounded-full text-black">
                        <Check className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-green-500">SENT TO EMAIL</p>
                        <p className="text-[10px] text-green-400/80">CHECK YOUR INBOX</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={handleRetake}>
                        <RotateCcw className="mr-2 w-4 h-4" />
                        NEW SESSION
                    </Button>
                    <Button className="h-12 bg-white text-black hover:bg-zinc-200 font-display tracking-wider">
                        <Download className="mr-2 w-4 h-4" />
                        SAVE
                    </Button>
                </div>
            </motion.div>
        )}
      </div>
    </BoothShell>
  );
}
