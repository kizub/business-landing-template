import { Router, Request, Response } from "express";
import { ChatMessagePayload, LeadPayload, AssistantResponse } from "../types/chat.js";
import axios from "axios";

const router = Router();

const MAKE_CHAT_WEBHOOK_URL = process.env.MAKE_CHAT_WEBHOOK_URL;
const MAKE_LEAD_WEBHOOK_URL = process.env.MAKE_LEAD_WEBHOOK_URL;
const WEBHOOK_TIMEOUT = 15000;

const SAFE_FALLBACK: AssistantResponse = {
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

// POST /api/chat/message
router.post("/message", async (req: Request, res: Response) => {
  try {
    const payload = req.body as ChatMessagePayload;

    if (!payload.sessionId || typeof payload.sessionId !== "string") {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }

    if (!payload.message || typeof payload.message !== "string" || payload.message.trim() === "") {
      return res.status(400).json({ ok: false, error: "message is required" });
    }

    if (payload.siteType !== "portfolio" && payload.siteType !== "demo") {
      return res.status(400).json({ ok: false, error: "invalid siteType" });
    }

    if (!MAKE_CHAT_WEBHOOK_URL) {
      console.error("MAKE_CHAT_WEBHOOK_URL is not configured");
      return res.json(SAFE_FALLBACK);
    }

    try {
      const response = await axios.post(MAKE_CHAT_WEBHOOK_URL, payload, {
        timeout: WEBHOOK_TIMEOUT,
        headers: { "Content-Type": "application/json" }
      });

      const data = response.data;

      if (data && typeof data.reply === "string") {
        return res.json({
          reply: data.reply,
          intent: data.intent || "unknown",
          lead_ready: !!data.lead_ready,
          show_form: !!data.show_form,
          quick_replies: Array.isArray(data.quick_replies) ? data.quick_replies : [],
          captured_fields: data.captured_fields || {},
          cta: {
            label: data.cta?.label || "Отримати консультацію",
            visible: data.cta?.visible !== undefined ? !!data.cta.visible : true
          }
        });
      } else {
        console.error("Invalid response structure from Make:", data);
        return res.json(SAFE_FALLBACK);
      }
    } catch (err: any) {
      console.error("Error calling Make chat webhook:", err.message);
      return res.json(SAFE_FALLBACK);
    }
  } catch (error: any) {
    console.error("Chat message route error:", error);
    return res.status(500).json(SAFE_FALLBACK);
  }
});

// POST /api/chat/lead
router.post("/lead", async (req: Request, res: Response) => {
  try {
    const payload = req.body as LeadPayload;

    if (!payload.sessionId || typeof payload.sessionId !== "string") {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }

    if (!payload.phone && !payload.telegram) {
      return res.status(400).json({ ok: false, error: "phone or telegram is required" });
    }

    if (!MAKE_LEAD_WEBHOOK_URL) {
      console.error("MAKE_LEAD_WEBHOOK_URL is not configured");
      return res.status(500).json({ ok: false, error: "Lead service not configured" });
    }

    try {
      await axios.post(MAKE_LEAD_WEBHOOK_URL, payload, {
        timeout: WEBHOOK_TIMEOUT,
        headers: { "Content-Type": "application/json" }
      });

      return res.json({ ok: true });
    } catch (err: any) {
      console.error("Error calling Make lead webhook:", err.message);
      return res.status(500).json({ ok: false, error: "Failed to send lead to external service" });
    }
  } catch (error: any) {
    console.error("Chat lead route error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;