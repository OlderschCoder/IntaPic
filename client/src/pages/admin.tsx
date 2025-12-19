import { BoothShell } from "@/components/booth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useLocation } from "wouter";
import { Settings, Save, ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("booth_settings");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      pricePerStrip: "5.00",
      emailSender: "bojeunm@gmail.com",
      allowUsb: true,
      kioskMode: true,
      autoPrint: true,
      adminEmail: "manager@billysayrlanes.com",
      enableQr: true,
      qrPaymentUrl: "https://venmo.com/billysayrlanes"
    };
  });

  const handleSave = () => {
    localStorage.setItem("booth_settings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Booth configuration has been saved locally.",
    });
  };

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <BoothShell>
      <div className="flex-1 flex flex-col p-8 bg-zinc-900/90 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-zinc-700 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-display text-white uppercase tracking-wider">Booth Admin</h1>
          </div>
          <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>

        <div className="space-y-8 max-w-lg mx-auto w-full">
          
          {/* Payment & Pricing */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono text-accent uppercase tracking-widest border-l-2 border-accent pl-3">Payment & Pricing</h2>
            <div className="grid gap-4 bg-black/40 p-4 rounded border border-zinc-800">
              <div className="space-y-2">
                <Label htmlFor="price">Price Per Strip ($)</Label>
                <Input 
                  id="price" 
                  value={settings.pricePerStrip}
                  onChange={(e) => setSettings({...settings, pricePerStrip: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 font-mono"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable QR Code Payment</Label>
                  <p className="text-[10px] text-zinc-500">Show QR option alongside card tap</p>
                </div>
                <Switch 
                  checked={settings.enableQr}
                  onCheckedChange={(checked) => setSettings({...settings, enableQr: checked})}
                />
              </div>

              {settings.enableQr && (
                <div className="space-y-2">
                  <Label htmlFor="qrUrl">QR Payment Link (Venmo, PayPal, etc.)</Label>
                  <Input 
                    id="qrUrl" 
                    value={settings.qrPaymentUrl}
                    onChange={(e) => setSettings({...settings, qrPaymentUrl: e.target.value})}
                    placeholder="https://venmo.com/yourbusiness"
                    className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                  />
                  <p className="text-[10px] text-zinc-500">Customers scan to pay with their phone</p>
                </div>
              )}
            </div>
          </section>

          {/* Delivery Options */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono text-accent uppercase tracking-widest border-l-2 border-accent pl-3">Delivery & Output</h2>
            <div className="grid gap-4 bg-black/40 p-4 rounded border border-zinc-800">
              <div className="space-y-2">
                <Label htmlFor="sender">Sender Email Address</Label>
                <Input 
                  id="sender" 
                  value={settings.emailSender}
                  onChange={(e) => setSettings({...settings, emailSender: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 font-mono"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow USB Drive Saving</Label>
                  <p className="text-[10px] text-zinc-500">Enable "Save to USB" button on result screen</p>
                </div>
                <Switch 
                  checked={settings.allowUsb}
                  onCheckedChange={(checked) => setSettings({...settings, allowUsb: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Print Receipt</Label>
                  <p className="text-[10px] text-zinc-500">Print receipt after successful payment</p>
                </div>
                <Switch 
                  checked={settings.autoPrint}
                  onCheckedChange={(checked) => setSettings({...settings, autoPrint: checked})}
                />
              </div>
            </div>
          </section>

          {/* Account */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono text-accent uppercase tracking-widest border-l-2 border-accent pl-3">System Access</h2>
            <div className="grid gap-4 bg-black/40 p-4 rounded border border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Kiosk Mode (No Password)</Label>
                  <p className="text-[10px] text-zinc-500">Auto-login standard user on boot</p>
                </div>
                <Switch 
                  checked={settings.kioskMode}
                  onCheckedChange={(checked) => setSettings({...settings, kioskMode: checked})}
                />
              </div>
              <div className="space-y-2">
                 <Label>Admin Recovery Email</Label>
                 <Input 
                   value={settings.adminEmail}
                   onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                   className="bg-zinc-800 border-zinc-700 font-mono"
                 />
              </div>
            </div>
          </section>

          <Button className="w-full bg-accent text-black hover:bg-accent/90 font-display text-lg tracking-widest" onClick={handleSave}>
            <Save className="w-5 h-5 mr-2" />
            SAVE CHANGES
          </Button>

        </div>
      </div>
    </BoothShell>
  );
}
