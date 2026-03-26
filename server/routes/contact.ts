import express from "express";
import axios from "axios";
import db from "../database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, contact, message, plan, source } = req.body;

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
  const webhookUrl = process.env.MAKE_WEBHOOK_URL || "https://hook.eu1.make.com/hc37q6huxwanpkovgw5xdk4clw7dxsbp";
  console.log("Attempting to send to webhook. URL used:", webhookUrl);

  if (webhookUrl) {
    try {
      console.log("Sending data to webhook:", webhookUrl);
      const webhookResponse = await axios.post(webhookUrl, {
        name,
        contact,
        message,
        plan,
        source: source || "Website Contact Form",
        timestamp: new Date().toISOString()
      }, {
        timeout: 10000 // 10 second timeout
      });
      console.log("Data sent to Make.com webhook successfully. Response status:", webhookResponse.status);
    } catch (error: any) {
      console.error("Error sending data to Make.com webhook:");
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received from webhook");
      } else {
        console.error("Error message:", error.message);
      }
    }
  } else {
    console.warn("MAKE_WEBHOOK_URL is not defined in environment variables. Please set it in the settings.");
  }

  res.json({ message: "Заявка отримана! Я зв'яжуся з вами найближчим часом." });
});

export default router;
