import { useLocation } from "wouter";
import { BoothShell } from "@/components/booth-shell";
import { motion } from "framer-motion";
import { Smartphone, Nfc, QrCode, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSwiping, setIsSwiping] = useState(false);
  const [photoType, setPhotoType] = useState<"bw" | "color">("bw");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentTab, setPaymentTab] = useState<"nfc" | "qr">("nfc");
  
  const [settings, setSettings] = useState({
    enableQr: true,
    qrPaymentUrl: "https://venmo.com/billysayrlanes",
    pricePerStrip: "5.00"
  });

  useEffect(() => {
    const saved = localStorage.getItem("booth_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({
        enableQr: parsed.enableQr !== false,
        qrPaymentUrl: parsed.qrPaymentUrl || "https://venmo.com/billysayrlanes",
        pricePerStrip: parsed.pricePerStrip || "5.00"
      });
    }
  }, []);

  const canProceed = email || phone;

  const handleTap = () => {
    if (!canProceed) return;
    localStorage.setItem("photo_type", photoType);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_phone", phone);
    setIsSwiping(true);
    setTimeout(() => {
      setLocation("/booth");
    }, 2000);
  };

  const handleConfirmPayment = () => {
    if (!canProceed) return;
    setPaymentConfirmed(true);
    localStorage.setItem("photo_type", photoType);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_phone", phone);
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
            <p className="font-mono text-xs text-muted-foreground">ENTER EMAIL OR PHONE TO RECEIVE PHOTOS</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs uppercase text-muted-foreground">Email Address (optional)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="YOU@EXAMPLE.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-zinc-700 font-mono text-lg h-12 focus:border-accent focus:ring-accent"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-mono text-xs uppercase text-muted-foreground">Phone Number (optional)</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-black/50 border-zinc-700 font-mono text-lg h-12 focus:border-accent focus:ring-accent"
                data-testid="input-phone"
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

            <div className="pt-4 space-y-4">
              {settings.enableQr && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentTab("nfc")}
                    className={`h-10 border-2 font-mono text-xs uppercase transition-all flex items-center justify-center gap-2 ${
                      paymentTab === "nfc" 
                        ? "bg-accent text-black border-accent" 
                        : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500"
                    }`}
                    data-testid="tab-nfc"
                  >
                    <Nfc className="w-4 h-4" />
                    Tap Card
                  </button>
                  <button
                    onClick={() => setPaymentTab("qr")}
                    className={`h-10 border-2 font-mono text-xs uppercase transition-all flex items-center justify-center gap-2 ${
                      paymentTab === "qr" 
                        ? "bg-accent text-black border-accent" 
                        : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500"
                    }`}
                    data-testid="tab-qr"
                  >
                    <QrCode className="w-4 h-4" />
                    Scan QR
                  </button>
                </div>
              )}

              {paymentTab === "qr" && settings.enableQr ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg mx-auto w-fit">
                    <QRCodeSVG 
                      value={settings.qrPaymentUrl} 
                      size={140}
                      level="H"
                      data-testid="qr-payment-code"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">SCAN TO PAY ${settings.pricePerStrip}</p>
                    <p className="font-mono text-[10px] text-zinc-600">Use your phone camera</p>
                  </div>
                  
                  {paymentConfirmed ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-2 py-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-green-400 font-display uppercase">Payment Confirmed!</span>
                    </motion.div>
                  ) : (
                    <Button 
                      onClick={handleConfirmPayment}
                      disabled={!canProceed}
                      className="w-full bg-accent text-black hover:bg-accent/90 font-display tracking-widest h-12"
                      data-testid="button-confirm-payment"
                    >
                      I'VE PAID - START PHOTOS
                    </Button>
                  )}
                </div>
              ) : (
                <div className="relative h-40 bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-600 flex flex-col items-center justify-center overflow-hidden group cursor-pointer" onClick={handleTap}>
                  {isSwiping ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-accent font-display text-xl uppercase flex flex-col items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
                      Processing...
                    </motion.div>
                  ) : (
                    <>
                      <div className="relative">
                        <Nfc className="w-16 h-16 text-zinc-500 mb-2 group-hover:text-white transition-colors animate-pulse" />
                        <Smartphone className="w-10 h-10 text-zinc-600 absolute bottom-0 -right-3 bg-zinc-800 rounded-full p-1 border-2 border-zinc-800 group-hover:text-zinc-300 transition-colors" />
                      </div>
                      <p className="font-mono text-xs text-zinc-400 group-hover:text-white transition-colors uppercase tracking-widest">TAP CARD OR PHONE HERE</p>
                      <p className="font-mono text-[10px] text-zinc-600 mt-1">${settings.pricePerStrip} CHARGE</p>
                    </>
                  )}
                  {!isSwiping && (
                    <motion.div 
                      className="absolute inset-0 border-4 border-accent/20 rounded-lg"
                      animate={{ scale: [1, 1.05, 1], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
           <div className="flex gap-2 items-center">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-mono text-zinc-500">
               {paymentTab === "qr" ? "QR PAYMENT" : "NFC READER ACTIVE"}
             </span>
           </div>
           <div className="flex gap-2">
             <span className="text-[10px] font-mono text-zinc-600">
               {paymentTab === "qr" ? "VENMO • PAYPAL • CASH APP" : "VISA • MC • AMEX • APPLE PAY"}
             </span>
           </div>
        </div>
      </div>
    </BoothShell>
  );
}
