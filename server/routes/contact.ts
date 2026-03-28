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

  // 1. Save to Database (Fallback)
  try {
    db.prepare(`
      INSERT INTO leads (name, contact, message, plan, source)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, contact, message || "", plan || null, source || "Website Contact Form");
    console.log("Lead saved to database successfully");
  } catch (dbError) {
    console.error("Error saving lead to database:", dbError);
    // We continue even if DB save fails, though it shouldn't
  }

  // 2. Send to Webhook (Make.com / Telegram)
  const webhookUrl = process.env.MAKE_WEBHOOK_URL?.trim();
  console.log("Attempting to send to webhook. URL used:", webhookUrl ? "URL is defined" : "URL is NOT defined");

  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      console.log("Sending data to webhook...");
      const webhookResponse = await axios.post(webhookUrl, {
        name: name,
        contact: contact,
        phone: contact,
        telegram: contact,
        message: message || "",
        comment: message || "",
        plan: plan || "Not specified",
        source: source || "Website Contact Form",
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 second timeout
      });
      console.log("Data sent to Make.com webhook successfully. Response status:", webhookResponse.status);
    } catch (error: any) {
      console.error("Error sending data to Make.com webhook:");
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received from webhook (timeout or network error)");
      } else {
        console.error("Error message:", error.message);
      }
      // We don't return error to user, as lead is already saved in DB
    }
  } else {
    console.warn("MAKE_WEBHOOK_URL is not defined or invalid in environment variables.");
  }

  return res.json({ message: "Заявка отримана! Я зв'яжуся з вами найближчим часом." });
});

export default router;
