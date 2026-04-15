import { Router, Request, Response } from "express";
import { ChatMessagePayload, LeadPayload } from "../types/chat.js";
import axios from "axios";
import { processChatMessage } from "../services/chat/chatSessionService.js";
import { db } from "../database.js";
import { chatMemoryStore } from "../services/chat/chatMemoryStore.js";

const router = Router();

const SAFE_FALLBACK = {
  reply: "Сталася помилка. Спробуйте ще раз.",
  intent: "unknown",
  lead_ready: false,
  show_form: false,
  quick_replies: [],
  captured_fields: {},
  cta: {
    label: "Отримати консультацію",
    visible: true
  }
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function generateDialogueSummary(messages: any[]): string {
  if (!messages || messages.length === 0) return "-";
  
  const userMessages = messages.filter(m => m.role === "user");
  if (userMessages.length === 0) return "-";

  const summaryLines: string[] = [];
  const allUserText = userMessages.map(m => m.text.toLowerCase()).join(" ");
  
  if (allUserText.includes("цін") || allUserText.includes("вартість") || allUserText.includes("скільки")) {
    summaryLines.push("- Питав про вартість послуг");
  }
  
  if (allUserText.includes("лендінг") || allUserText.includes("landing")) {
    summaryLines.push("- Обговорювали розробку лендінгу");
  } else if (allUserText.includes("сайт") || allUserText.includes("бізнес")) {
    summaryLines.push("- Обговорювали бізнес-сайт");
  }

  if (allUserText.includes("ai") || allUserText.includes("менеджер") || allUserText.includes("бот")) {
    summaryLines.push("- Цікавився AI-менеджером/автоматизацією");
  }

  if (allUserText.includes("заявк") || allUserText.includes("контакт") || allUserText.includes("залишити")) {
    summaryLines.push("- Виявив готовність залишити контакти");
  }

  if (summaryLines.length < 3) {
    const lastMsg = userMessages[userMessages.length - 1].text;
    summaryLines.push(`- Останній меседж: "${lastMsg.substring(0, 60)}${lastMsg.length > 60 ? "..." : ""}"`);
  }

  return summaryLines.slice(0, 5).join("\n");
}

// POST /api/chat/message
router.post("/message", async (req: Request, res: Response) => {
  try {
    const payload = req.body as ChatMessagePayload;

    if (!isNonEmptyString(payload?.sessionId)) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }

    if (!isNonEmptyString(payload?.message)) {
      return res.status(400).json({ ok: false, error: "message is required" });
    }

    if (payload.siteType !== "portfolio" && payload.siteType !== "demo") {
      return res.status(400).json({ ok: false, error: "invalid siteType" });
    }

    const normalized = await processChatMessage(payload);
    return res.json(normalized);
  } catch (err: any) {
    console.error("Error processing chat message:", err?.message || err);
    return res.json(SAFE_FALLBACK);
  }
});

// POST /api/chat/lead
router.post("/lead", async (req: Request, res: Response) => {
  try {
    const payload = req.body as LeadPayload & {
      conversation_stage?: string;
      manager_note?: string;
      user_journey?: string[];
    };

    if (!isNonEmptyString(payload?.sessionId)) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }

    if (!payload.phone && !payload.telegram) {
      return res.status(400).json({ ok: false, error: "phone or telegram is required" });
    }

    const contact = [payload.phone, payload.telegram].filter(Boolean).join(" / ");
    const source = "website_chat";
    const session = chatMemoryStore.getSession(payload.sessionId);

    let summary = "-";

    if (payload.manager_note || payload.user_journey) {
      const journey = Array.isArray(payload.user_journey) ? payload.user_journey : [];
      const journeyText = journey.length
        ? journey.map((step: string, i: number) => `${i + 1}. ${step}`).join("\n")
        : "-";

      summary = `
Етап:
${payload.conversation_stage || "-"}

Що хоче клієнт:
${payload.manager_note || "-"}

Хід діалогу:
${journeyText}
      `.trim();
    } else {
      summary = session ? generateDialogueSummary(session.messages) : "-";
    }

    const existing = await db.get("SELECT id FROM leads WHERE session_id = ?", [payload.sessionId]);
    
    if (existing) {
      await db.run(
        `UPDATE leads SET 
          name = ?, 
          contact = ?, 
          message = ?,
          summary = ?
        WHERE session_id = ?`,
        [payload.name, contact, payload.comment, summary, payload.sessionId]
      );
    } else {
      await db.run(
        `INSERT INTO leads (session_id, name, contact, message, summary, source) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [payload.sessionId, payload.name, contact, payload.comment, summary, source]
      );
    }

    if (session) {
      session.name = payload.name;
      session.phone = payload.phone;
      session.telegram = payload.telegram;
      session.leadCreated = true;
      session.updatedAt = new Date().toISOString();
      chatMemoryStore.setSession(payload.sessionId, session);
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

    if (botToken && chatId) {
      (async () => {
        try {
          const messageText = `
🔥 НОВИЙ ЛІД

👤 Ім'я: ${payload.name || "-"}
📞 Телефон: ${payload.phone || "-"}
✈️ Telegram: ${payload.telegram || "-"}
💬 Коментар: ${payload.comment || "-"}

${summary}

🆔 Session: ${payload.sessionId}
📍 Source: website_chat
          `.trim();

          const tgRes = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: messageText,
          });

          console.log(`[Telegram] Chat lead sent successfully. Message ID: ${tgRes.data?.result?.message_id}`);
        } catch (tgErr: any) {
          console.error("[Telegram] Error sending chat lead:");
          if (tgErr.response) {
            console.error(`- Status: ${tgErr.response.status}`);
            console.error(`- Data: ${JSON.stringify(tgErr.response.data)}`);
          } else {
            console.error(`- Message: ${tgErr.message}`);
          }
        }
      })();
    } else {
      console.warn("[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID for chat lead.");
    }

    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Error saving lead to DB:", err?.message || err);
    return res.status(500).json({ ok: false, error: "Failed to save lead locally" });
  }
});

export default router;
