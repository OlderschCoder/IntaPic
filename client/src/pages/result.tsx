import { useLocation } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Download, RotateCcw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Result() {
  const [, setLocation] = useLocation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [isPrinting, setIsPrinting] = useState(true);

  useEffect(() => {
    const storedPhotos = localStorage.getItem("booth_photos");
    const storedEmail = localStorage.getItem("user_email");
    
    if (storedPhotos) {
      setPhotos(JSON.parse(storedPhotos));
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
    
    // Simulate printing time
    setTimeout(() => setIsPrinting(false), 3000);
  }, []);

  const handleRetake = () => {
    setLocation("/");
  };

  const handleDownload = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas (strip dimensions)
    const stripWidth = 300;
    const photoHeight = 225; // 4:3 aspect ratio
    const padding = 20;
    const headerHeight = 100;
    const footerHeight = 60;
    const totalHeight = headerHeight + (photoHeight * 4) + (padding * 5) + footerHeight;

    canvas.width = stripWidth;
    canvas.height = totalHeight;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, stripWidth, totalHeight);

    // Draw Header
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px Oswald';
    ctx.fillText('PHOTO', stripWidth / 2, 50);
    ctx.fillText('MATIC', stripWidth / 2, 90);

    // Draw Photos
    let currentY = headerHeight + padding;
    
    for (const src of photos) {
      const img = new Image();
      img.src = src;
      await new Promise((resolve) => { img.onload = resolve; });
      
      // Draw photo border
      ctx.fillStyle = '#e4e4e7'; // zinc-200
      ctx.fillRect(padding - 2, currentY - 2, stripWidth - (padding * 2) + 4, photoHeight + 4);
      
      // Draw photo
      ctx.drawImage(img, padding, currentY, stripWidth - (padding * 2), photoHeight);
      
      currentY += photoHeight + padding;
    }

    // Draw Footer
    ctx.fillStyle = '#000000';
    ctx.font = '12px Courier Prime';
    ctx.fillText(`ID: #${Math.random().toString(36).substr(2, 6).toUpperCase()}`, stripWidth / 2, totalHeight - 30);
    ctx.fillText(new Date().toLocaleDateString(), stripWidth / 2, totalHeight - 15);

    // Download
    const link = document.createElement('a');
    link.download = `photobooth-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email}?subject=Your Photo Booth Strip&body=Here are your photos from Billy's Ayr Lanes!`;
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
                <div className="bg-green-500/10 border border-green-500/50 p-4 rounded flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 p-1 rounded-full text-black">
                            <Check className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-green-500">SENT TO EMAIL</p>
                            <p className="text-[10px] text-green-400/80 uppercase">{email || "UNKNOWN EMAIL"}</p>
                        </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-green-500 hover:text-green-400 hover:bg-green-500/20" onClick={handleEmail}>
                        <Mail className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={handleRetake}>
                        <RotateCcw className="mr-2 w-4 h-4" />
                        NEW SESSION
                    </Button>
                    <Button className="h-12 bg-white text-black hover:bg-zinc-200 font-display tracking-wider" onClick={handleDownload}>
                        <Download className="mr-2 w-4 h-4" />
                        SAVE STRIP
                    </Button>
                </div>
            </motion.div>
        )}
      </div>
    </BoothShell>
  );
}
