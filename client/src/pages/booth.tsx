import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion, AnimatePresence } from "framer-motion";
import { getBackgroundById, scenicBackgrounds } from "@/lib/backgrounds";
import { SelfieSegmentation, Results } from "@mediapipe/selfie_segmentation";

const PHOTOS_TO_TAKE = 4;
const COUNTDOWN_SECONDS = 3;

export default function Booth() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [backgroundId, setBackgroundId] = useState("none");
  const [segmentationReady, setSegmentationReady] = useState(false);
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const lastMaskRef = useRef<ImageData | null>(null);

  // Initialize Camera, segmentation, and load settings
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    // Load background selection
    const savedBackground = localStorage.getItem("photo_background");
    if (savedBackground) {
      setBackgroundId(savedBackground);
    }

    // Preload background image
    const bg = savedBackground ? getBackgroundById(savedBackground) : null;
    if (bg && bg.image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        backgroundImageRef.current = img;
      };
      img.src = bg.image;
    }

    // Initialize selfie segmentation
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: true,
    });

    selfieSegmentation.onResults((results: Results) => {
      if (canvasRef.current && results.segmentationMask) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          // Store the mask for use during photo capture
          ctx.drawImage(results.segmentationMask, 0, 0);
          lastMaskRef.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    });

    segmentationRef.current = selfieSegmentation;
    setSegmentationReady(true);
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Process frames for segmentation when background is selected
          videoRef.current.onloadedmetadata = () => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          };
        }
        setCameraError(false);
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(true);
      }
    };

    startCamera();

    // Periodic segmentation updates
    let segInterval: NodeJS.Timeout | null = null;
    if (savedBackground && savedBackground !== "none") {
      segInterval = setInterval(async () => {
        if (videoRef.current && segmentationRef.current && videoRef.current.readyState >= 2) {
          await segmentationRef.current.send({ image: videoRef.current });
        }
      }, 100);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (segInterval) {
        clearInterval(segInterval);
      }
      if (segmentationRef.current) {
        segmentationRef.current.close();
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

    const takePhoto = async () => {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200);

      const background = getBackgroundById(backgroundId);
      const type = localStorage.getItem("photo_type") || "bw";
      let photoData = "";

      try {
        if (videoRef.current && !cameraError && videoRef.current.videoWidth > 0) {
          // Get fresh segmentation mask with timeout
          if (segmentationRef.current && background.id !== "none") {
            try {
              await Promise.race([
                segmentationRef.current.send({ image: videoRef.current }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 500))
              ]);
            } catch (e) {
              console.log("Segmentation skipped:", e);
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            // If we have a background and segmentation mask, do proper compositing
            if (background.id !== "none" && background.image && backgroundImageRef.current && lastMaskRef.current) {
              // Draw background first
              ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
              
              // Create a temporary canvas for the masked person
              const personCanvas = document.createElement("canvas");
              personCanvas.width = canvas.width;
              personCanvas.height = canvas.height;
              const personCtx = personCanvas.getContext("2d");
              
              if (personCtx) {
                // Apply photo filter
                if (type === "bw") {
                  personCtx.filter = "grayscale(100%) contrast(120%) brightness(110%)";
                } else {
                  personCtx.filter = "contrast(110%) brightness(105%) saturate(120%) sepia(20%)";
                }
                
                // Draw the video frame (flipped horizontally for selfie mode)
                personCtx.save();
                personCtx.scale(-1, 1);
                personCtx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
                personCtx.restore();
                personCtx.filter = "none";
                
                // Get the person image data
                const personData = personCtx.getImageData(0, 0, canvas.width, canvas.height);
                const mask = lastMaskRef.current;
                const width = canvas.width;
                const height = canvas.height;
                
                // Apply mask with improved edge handling to eliminate halo
                // Use higher thresholds: below 180 = transparent, above 220 = opaque, feather between
                const LOW_THRESHOLD = 180;
                const HIGH_THRESHOLD = 220;
                
                for (let y = 0; y < height; y++) {
                  for (let x = 0; x < width; x++) {
                    const personIdx = (y * width + x) * 4;
                    const maskX = width - 1 - x;
                    const maskIdx = (y * width + maskX) * 4;
                    const maskValue = mask.data[maskIdx];
                    
                    if (maskValue < LOW_THRESHOLD) {
                      // Definitely background - fully transparent
                      personData.data[personIdx + 3] = 0;
                    } else if (maskValue >= HIGH_THRESHOLD) {
                      // Definitely person - fully opaque
                      personData.data[personIdx + 3] = 255;
                    } else {
                      // Edge zone - smooth feathering
                      const alpha = ((maskValue - LOW_THRESHOLD) / (HIGH_THRESHOLD - LOW_THRESHOLD)) * 255;
                      personData.data[personIdx + 3] = Math.round(alpha);
                    }
                  }
                }
                
                personCtx.putImageData(personData, 0, 0);
                ctx.drawImage(personCanvas, 0, 0);
              }
            } else {
              // No background or no segmentation - just capture the video with filter
              if (type === "bw") {
                ctx.filter = "grayscale(100%) contrast(120%) brightness(110%)";
              } else {
                ctx.filter = "contrast(110%) brightness(105%) saturate(120%) sepia(20%)";
              }
              
              ctx.save();
              ctx.scale(-1, 1);
              ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
              ctx.restore();
              ctx.filter = "none";
            }
            
            photoData = canvas.toDataURL("image/jpeg", 0.92);
          }
        } else {
          // Fallback / Simulation Mode
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            if (background.id !== "none" && background.image && backgroundImageRef.current) {
              ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
            } else {
              ctx.fillStyle = "#111";
              ctx.fillRect(0, 0, 640, 480);
            }
            
            ctx.fillStyle = "#fff";
            ctx.font = "bold 32px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`POSE ${photos.length + 1}`, 320, 240);
            ctx.font = "14px monospace";
            ctx.fillText("(Camera Simulation Mode)", 320, 280);
            
            photoData = canvas.toDataURL("image/jpeg");
          }
        }
      } catch (err) {
        console.error("Photo capture error:", err);
      }

      // Always add to photos to continue the sequence
      setPhotos(prev => [...prev, photoData || "data:image/jpeg;base64,"]);
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
        
        {/* Hidden canvas for segmentation processing */}
        <canvas ref={canvasRef} className="hidden" />
        
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

        {/* Background indicator */}
        {backgroundId !== "none" && (
          <div className="absolute top-4 right-4 z-30 bg-black/60 px-3 py-1 rounded-full">
            <span className="text-[10px] font-mono text-accent uppercase">
              {scenicBackgrounds.find(bg => bg.id === backgroundId)?.name}
            </span>
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
