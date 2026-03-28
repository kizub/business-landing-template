import express from "express";
import axios from "axios";
import db from "../database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, contact, message, plan, source, recaptchaToken } = req.body;

  // reCAPTCHA verification
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (recaptchaToken && secretKey) {
    try {
      const recaptchaRes = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
      );
      if (!recaptchaRes.data.success || recaptchaRes.data.score < 0.5) {
        console.warn("reCAPTCHA verification failed for lead:", name);
        return res.status(400).json({ message: "reCAPTCHA verification failed. Are you a bot?" });
      }
    } catch (err) {
      console.error("reCAPTCHA error:", err);
    }
  }

  if (!name || !contact) {
    return res.status(400).json({ message: "Name and contact are required" });
  }

  // 1. Save to Database (Primary)
  let leadId: number | string | null = null;
  try {
    const result = await db.run(`
      INSERT INTO leads (name, contact, message, plan, source)
      VALUES (?, ?, ?, ?, ?)
    `, [name, contact, message || "", plan || null, source || "Website Contact Form"]);
    leadId = result.lastInsertRowid || "new";
    console.log(`Lead saved to database successfully. ID: ${leadId}`);
  } catch (dbError) {
    console.error("Error saving lead to database:", dbError);
    // We continue to try webhook even if DB fails
  }

  // 2. Send to Webhook (Make.com / Telegram) - Run in background to not block user
  const webhookUrl = process.env.MAKE_WEBHOOK_URL?.trim();
  
  if (webhookUrl && webhookUrl.startsWith('http')) {
    // Fire and forget (with logging)
    (async () => {
      try {
        console.log(`[Background] Sending lead ${leadId} to webhook: ${webhookUrl}`);
        const payload = {
          id: leadId,
          name: name,
          contact: contact,
          phone: contact,
          telegram: contact,
          message: message || "",
          comment: message || "",
          plan: plan || "Not specified",
          source: source || "Website Contact Form",
          timestamp: new Date().toISOString(),
          url: req.headers.referer || "unknown"
        };
        
        const webhookResponse = await axios.post(webhookUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout for background task
        });
        
        console.log(`[Background] Webhook success for lead ${leadId}. Status: ${webhookResponse.status}`);
      } catch (error: any) {
        console.error(`[Background] Webhook error for lead ${leadId}:`);
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", error.response.data);
        } else {
          console.error("Message:", error.message);
        }
      }
    })();
  } else {
    console.warn("MAKE_WEBHOOK_URL is not defined or invalid. Skipping webhook.");
  }

  return res.json({ 
    success: true,
    message: "Заявка отримана! Я зв'яжуся з вами найближчим часом." 
  });
});

export default router;
