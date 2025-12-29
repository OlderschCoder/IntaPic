import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion, AnimatePresence } from "framer-motion";
import { getBackgroundById } from "@/lib/backgrounds";

const PHOTOS_TO_TAKE = 4;
const COUNTDOWN_SECONDS = 3;

export default function Booth() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [backgroundId, setBackgroundId] = useState("none");

  // Initialize Camera and load settings
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    // Load background selection
    const savedBackground = localStorage.getItem("photo_background");
    if (savedBackground) {
      setBackgroundId(savedBackground);
    }
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(false);
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(true);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Photo Taking Sequence
  useEffect(() => {
    if (photos.length >= PHOTOS_TO_TAKE) {
      // Finished!
      setTimeout(() => {
        localStorage.setItem("booth_photos", JSON.stringify(photos));
        setLocation("/result");
      }, 1000);
      return;
    }

    let timer: NodeJS.Timeout;

    const takePhoto = () => {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200); // Flash duration

      const background = getBackgroundById(backgroundId);

      if (videoRef.current && !cameraError) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            // Draw background first if selected
            if (background.id !== "none") {
              // Create gradient from CSS string
              const gradientMatch = background.gradient.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
              if (gradientMatch) {
                const angle = parseInt(gradientMatch[1]);
                const colorStops = gradientMatch[2].split(/,\s*(?=[#a-z])/);
                
                // Calculate gradient coordinates based on angle
                const rad = (angle - 90) * Math.PI / 180;
                const x1 = canvas.width / 2 - Math.cos(rad) * canvas.width;
                const y1 = canvas.height / 2 - Math.sin(rad) * canvas.height;
                const x2 = canvas.width / 2 + Math.cos(rad) * canvas.width;
                const y2 = canvas.height / 2 + Math.sin(rad) * canvas.height;
                
                const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                colorStops.forEach((stop) => {
                  const parts = stop.trim().split(/\s+/);
                  const color = parts[0];
                  const position = parts[1] ? parseInt(parts[1]) / 100 : 0;
                  gradient.addColorStop(position, color);
                });
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
            }

            // Apply Photo Filter
            const type = localStorage.getItem("photo_type") || "bw";
            
            if (type === "bw") {
              ctx.filter = "grayscale(100%) contrast(120%) brightness(110%)";
            } else {
              // Vintage Color Look
              ctx.filter = "contrast(110%) brightness(105%) saturate(120%) sepia(20%)";
            }
            
            // Draw video with some transparency if background is set
            if (background.id !== "none") {
              ctx.globalAlpha = 0.85;
            }
            ctx.drawImage(videoRef.current, 0, 0);
            ctx.globalAlpha = 1.0;
            ctx.filter = "none";
            
            const photoData = canvas.toDataURL("image/jpeg");
            setPhotos(prev => [...prev, photoData]);
        }
      } else {
        // Fallback / Simulation Mode
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            // Draw background for simulation too
            if (background.id !== "none") {
              const gradientMatch = background.gradient.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
              if (gradientMatch) {
                const colorStops = gradientMatch[2].split(/,\s*(?=[#a-z])/);
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                colorStops.forEach((stop) => {
                  const parts = stop.trim().split(/\s+/);
                  const color = parts[0];
                  const position = parts[1] ? parseInt(parts[1]) / 100 : 0;
                  gradient.addColorStop(position, color);
                });
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
            } else {
              ctx.fillStyle = "#111";
              ctx.fillRect(0, 0, 640, 480);
            }
            
            ctx.fillStyle = "#333";
            ctx.font = "40px monospace";
            ctx.fillText(`POSE ${photos.length + 1}`, 240, 240);
            // Add some random noise
            for (let i = 0; i < 100; i++) {
              ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
              ctx.fillRect(Math.random() * 640, Math.random() * 480, 2, 2);
            }
            const photoData = canvas.toDataURL("image/jpeg");
            setPhotos(prev => [...prev, photoData]);
        }
      }
    };

    const runCountdown = (seconds: number) => {
      setCount(seconds);
      if (seconds > 0) {
        timer = setTimeout(() => runCountdown(seconds - 1), 1000);
      } else {
        setCount(null);
        takePhoto();
      }
    };

    // Start countdown for next photo
    const startDelay = setTimeout(() => runCountdown(COUNTDOWN_SECONDS), 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(startDelay);
    };
  }, [photos.length, setLocation, cameraError, backgroundId]);


  return (
    <BoothShell>
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        
        {/* Camera Feed */}
        {!cameraError ? (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-90 scale-x-[-1]" 
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center">
             <div className="text-zinc-700 font-mono text-xl animate-pulse">CAMERA SIMULATION</div>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none border-[20px] border-black/50 z-10" />
        
        {/* Crosshair / UI */}
        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-30 pointer-events-none">
            <div className="w-[80%] h-[80%] border border-white/50 rounded-sm" />
            <div className="absolute w-4 h-4 bg-red-500/50 rounded-full" />
        </div>

        {/* Countdown */}
        <AnimatePresence>
          {count !== null && count > 0 && (
            <motion.div
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute z-30 text-9xl font-display text-white drop-shadow-lg"
            >
              {count}
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Get Ready" Indicator */}
        {count !== null && count > 0 && (
             <div className="absolute top-8 text-accent font-mono uppercase tracking-widest bg-black/50 px-4 py-1 rounded-full animate-pulse z-30">
                Get Ready
             </div>
        )}
        
        {/* Flash Effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300" />
        )}

        {/* Progress Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-30">
          {[...Array(PHOTOS_TO_TAKE)].map((_, i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full border-2 border-white transition-colors ${
                i < photos.length ? "bg-white" : 
                i === photos.length ? "bg-accent animate-pulse" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </BoothShell>
  );
}
