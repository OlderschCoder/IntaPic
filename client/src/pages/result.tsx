import { useLocation } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Check, Download, RotateCcw, Mail, AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Result() {
  const [, setLocation] = useLocation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isPrinting, setIsPrinting] = useState(true);
  const [showSaveButton, setShowSaveButton] = useState(true);
  const [emailStatus, setEmailStatus] = useState<"pending" | "sending" | "sent" | "error">("pending");
  const [smsStatus, setSmsStatus] = useState<"pending" | "sending" | "sent" | "error">("pending");
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 8).toUpperCase());
  const emailSentRef = useRef(false);
  const smsSentRef = useRef(false);
  const [photoStripUrl, setPhotoStripUrl] = useState<string>("");

  useEffect(() => {
    const storedPhotos = localStorage.getItem("booth_photos");
    const storedEmail = localStorage.getItem("user_email");
    const settings = localStorage.getItem("booth_settings");
    
    if (storedPhotos) {
      setPhotos(JSON.parse(storedPhotos));
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
    const storedPhone = localStorage.getItem("user_phone");
    if (storedPhone) {
      setPhone(storedPhone);
    }
    if (settings) {
      const parsed = JSON.parse(settings);
      setShowSaveButton(parsed.allowUsb);
    }
    
    // Simulate printing time
    setTimeout(() => setIsPrinting(false), 3000);
  }, []);

  // Auto-send email when photos are ready
  useEffect(() => {
    if (!isPrinting && photos.length > 0 && email && !emailSentRef.current) {
      emailSentRef.current = true;
      sendEmailWithPhotos();
    }
  }, [isPrinting, photos, email]);

  // Auto-send SMS when photos are ready (if phone provided)
  useEffect(() => {
    if (!isPrinting && photos.length > 0 && phone && photoStripUrl && !smsSentRef.current) {
      smsSentRef.current = true;
      sendSmsWithPhotos();
    }
  }, [isPrinting, photos, phone, photoStripUrl]);

  const generatePhotoStrip = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas not supported");

    // Setup canvas (strip dimensions)
    const stripWidth = 300;
    const photoHeight = 225; // 4:3 aspect ratio
    const padding = 20;
    const headerHeight = 100;
    const footerHeight = 60;
    const totalHeight = headerHeight + (photoHeight * photos.length) + (padding * (photos.length + 1)) + footerHeight;

    canvas.width = stripWidth;
    canvas.height = totalHeight;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, stripWidth, totalHeight);

    // Draw Header
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px sans-serif';
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
    ctx.font = '12px monospace';
    ctx.fillText(`ID: #${sessionId}`, stripWidth / 2, totalHeight - 30);
    ctx.fillText(new Date().toLocaleDateString(), stripWidth / 2, totalHeight - 15);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const sendEmailWithPhotos = async () => {
    try {
      setEmailStatus("sending");
      
      const photoStrip = await generatePhotoStrip();
      
      const response = await fetch("/api/send-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          photoStrip,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setEmailStatus("sent");
    } catch (err) {
      console.error("Email error:", err);
      setEmailStatus("error");
    }
  };

  const sendSmsWithPhotos = async () => {
    try {
      setSmsStatus("sending");
      
      // For SMS, we need a publicly accessible URL
      // We'll upload the photo strip and get a URL back
      const photoStrip = photoStripUrl || await generatePhotoStrip();
      
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          photoUrl: photoStrip, // This needs to be a public URL for Twilio MMS
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send SMS");
      }

      setSmsStatus("sent");
    } catch (err) {
      console.error("SMS error:", err);
      setSmsStatus("error");
    }
  };

  const handleResendSms = () => {
    smsSentRef.current = false;
    setSmsStatus("pending");
    sendSmsWithPhotos();
  };

  const handleRetake = () => {
    setLocation("/");
  };

  const handleDownload = async () => {
    const photoStrip = await generatePhotoStrip();
    const link = document.createElement('a');
    link.download = `photobooth-${sessionId}.jpg`;
    link.href = photoStrip;
    link.click();
  };

  const handleResendEmail = () => {
    emailSentRef.current = false;
    setEmailStatus("pending");
    sendEmailWithPhotos();
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
              style={{ width: "140px" }}
            >
              {/* Strip Header */}
              <div className="text-center py-2 border-b-2 border-black mb-2">
                <h3 className="font-display text-black text-lg leading-none">PHOTO<br/>MATIC</h3>
                <p className="text-[8px] font-mono text-black">{new Date().toLocaleDateString()}</p>
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
                 <p className="font-mono text-[8px] text-black/50">ID: #{sessionId}</p>
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
                {/* Email Status */}
                {emailStatus === "sending" && (
                  <div className="bg-blue-500/10 border border-blue-500/50 p-4 rounded flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <div>
                      <p className="text-sm font-bold text-blue-500">SENDING EMAIL...</p>
                      <p className="text-[10px] text-blue-400/80 uppercase">{email}</p>
                    </div>
                  </div>
                )}

                {emailStatus === "sent" && (
                  <div className="bg-green-500/10 border border-green-500/50 p-4 rounded flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-1 rounded-full text-black">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-500">SENT TO EMAIL</p>
                        <p className="text-[10px] text-green-400/80 uppercase">{email}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-green-500 hover:text-green-400 hover:bg-green-500/20" onClick={handleResendEmail}>
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {emailStatus === "error" && (
                  <div className="bg-red-500/10 border border-red-500/50 p-4 rounded flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500 p-1 rounded-full text-white">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-500">EMAIL FAILED</p>
                        <p className="text-[10px] text-red-400/80">Tap to retry or save locally</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-400 hover:bg-red-500/20" onClick={handleResendEmail}>
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* SMS Status - only show if phone provided */}
                {phone && (
                  <>
                    {smsStatus === "sending" && (
                      <div className="bg-purple-500/10 border border-purple-500/50 p-4 rounded flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                        <div>
                          <p className="text-sm font-bold text-purple-500">SENDING TEXT...</p>
                          <p className="text-[10px] text-purple-400/80 uppercase">{phone}</p>
                        </div>
                      </div>
                    )}

                    {smsStatus === "sent" && (
                      <div className="bg-purple-500/10 border border-purple-500/50 p-4 rounded flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-500 p-1 rounded-full text-white">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-purple-500">SENT TO PHONE</p>
                            <p className="text-[10px] text-purple-400/80 uppercase">{phone}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 text-purple-500 hover:text-purple-400 hover:bg-purple-500/20" onClick={handleResendSms}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {smsStatus === "error" && (
                      <div className="bg-orange-500/10 border border-orange-500/50 p-4 rounded flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500 p-1 rounded-full text-white">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-orange-500">TEXT FAILED</p>
                            <p className="text-[10px] text-orange-400/80">Tap to retry</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 text-orange-500 hover:text-orange-400 hover:bg-orange-500/20" onClick={handleResendSms}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}

                <div className={`grid gap-4 ${showSaveButton ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <Button variant="outline" className="h-12 border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={handleRetake}>
                        <RotateCcw className="mr-2 w-4 h-4" />
                        NEW SESSION
                    </Button>
                    {showSaveButton && (
                      <Button className="h-12 bg-white text-black hover:bg-zinc-200 font-display tracking-wider" onClick={handleDownload}>
                          <Download className="mr-2 w-4 h-4" />
                          SAVE STRIP
                      </Button>
                    )}
                </div>
            </motion.div>
        )}
      </div>
    </BoothShell>
  );
}
