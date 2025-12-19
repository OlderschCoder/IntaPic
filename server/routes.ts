import type { Express } from "express";
import { createServer, type Server } from "http";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Send photo strip via email
  app.post("/api/send-photos", async (req, res) => {
    try {
      const { email, photoStrip, sessionId } = req.body;

      if (!email || !photoStrip) {
        return res.status(400).json({ error: "Email and photo strip are required" });
      }

      // Convert base64 to buffer for attachment
      const base64Data = photoStrip.replace(/^data:image\/\w+;base64,/, "");
      const photoBuffer = Buffer.from(base64Data, "base64");

      const { data, error } = await resend.emails.send({
        from: "Billy's Photo Booth <billys@classicpic.com>",
        to: email,
        subject: "Your Photo Strip from Billy's Ayr Lanes! 📸",
        html: `
          <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #f5f5f5; padding: 40px;">
            <div style="text-align: center; border-bottom: 2px solid #fbbf24; padding-bottom: 20px; margin-bottom: 30px;">
              <h1 style="color: #fbbf24; font-size: 28px; margin: 0;">BILLY'S AYR LANES</h1>
              <p style="color: #888; font-size: 12px; margin-top: 10px;">PHOTO-MATIC 2000</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #fff; font-size: 20px;">Thanks for visiting our booth!</h2>
              <p style="color: #aaa; font-size: 14px;">Your photo strip is attached below. Save it, share it, and come back soon!</p>
            </div>
            
            <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
              <p style="color: #666; font-size: 11px; margin: 0;">Session ID: ${sessionId || "N/A"}</p>
              <p style="color: #666; font-size: 11px; margin: 5px 0 0 0;">${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 10px;">Billy's Ayr Lanes • Photo Booth Experience</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `photobooth-${sessionId || Date.now()}.jpg`,
            content: photoBuffer,
          },
        ],
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: "Failed to send email", details: error.message });
      }

      return res.json({ success: true, messageId: data?.id });
    } catch (err: any) {
      console.error("Email send error:", err);
      return res.status(500).json({ error: "Failed to send email", details: err.message });
    }
  });

  return httpServer;
}
