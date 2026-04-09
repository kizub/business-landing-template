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

  // 2. Send to Telegram - Run in background to not block user
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    (async () => {
      try {
        console.log(`[Background] Sending lead ${leadId} to Telegram`);
        const referer = req.headers.referer || "unknown";
        const messageText = `🚀 Нова заявка з сайту\n\n👤 Ім'я: ${name || "-"}\n📞 Контакт: ${contact || "-"}\n💎 План: ${plan || "Не вказано"}\n📍 Джерело: ${source || "Основна форма"}\n🔗 Сторінка: ${referer}\n\n📝 Повідомлення:\n${message || "-"}\n\nID в БД: ${leadId}`;

        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: chatId,
          text: messageText,
        });
        console.log(`[Background] Telegram notification sent for lead ${leadId}`);
      } catch (tgErr: any) {
        console.error(`[Background] Error sending lead ${leadId} to Telegram:`, tgErr?.message || tgErr);
      }
    })();
  } else {
    console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not defined. Skipping Telegram notification.");
  }

  return res.json({ 
    success: true,
    message: "Заявка отримана! Я зв'яжуся з вами найближчим часом." 
  });
});

export default router;
