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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function safeParseJson(value: unknown): any {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeQuickReplies(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeAssistantResponse(raw: unknown): AssistantResponse {
  const data = safeParseJson(raw);

  if (!data || typeof data !== "object") {
    return SAFE_FALLBACK;
  }

  const obj = data as Record<string, any>;
  const cta = obj.cta && typeof obj.cta === "object" ? obj.cta : {};

  const reply =
    typeof obj.reply === "string" && obj.reply.trim()
      ? obj.reply.trim()
      : SAFE_FALLBACK.reply;

  const intent =
    typeof obj.intent === "string" && obj.intent.trim()
      ? obj.intent.trim()
      : "unknown";

  const lead_ready = typeof obj.lead_ready === "boolean" ? obj.lead_ready : false;
  const show_form = typeof obj.show_form === "boolean" ? obj.show_form : false;

  const quick_replies = normalizeQuickReplies(obj.quick_replies);

  const captured_fields =
    obj.captured_fields && typeof obj.captured_fields === "object" && !Array.isArray(obj.captured_fields)
      ? obj.captured_fields
      : {};

  const label =
    typeof cta.label === "string" && cta.label.trim()
      ? cta.label.trim()
      : "Отримати консультацію";

  const visible = typeof cta.visible === "boolean" ? cta.visible : true;

  return {
    reply,
    intent,
    lead_ready,
    show_form,
    quick_replies,
    captured_fields,
    cta: {
      label,
      visible
    }
  };
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

    if (!MAKE_CHAT_WEBHOOK_URL) {
      console.error("MAKE_CHAT_WEBHOOK_URL is not configured");
      return res.json(SAFE_FALLBACK);
    }

    const response = await axios.post(MAKE_CHAT_WEBHOOK_URL, payload, {
      timeout: WEBHOOK_TIMEOUT,
      headers: { "Content-Type": "application/json" }
    });

    const normalized = normalizeAssistantResponse(response.data);
    return res.json(normalized);
  } catch (err: any) {
    console.error("Error calling Make chat webhook:", err?.message || err);
    return res.json(SAFE_FALLBACK);
  }
});

// POST /api/chat/lead
router.post("/lead", async (req: Request, res: Response) => {
  try {
    const payload = req.body as LeadPayload;

    if (!isNonEmptyString(payload?.sessionId)) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }

    if (!payload.phone && !payload.telegram) {
      return res.status(400).json({ ok: false, error: "phone or telegram is required" });
    }

    if (!MAKE_LEAD_WEBHOOK_URL) {
      console.error("MAKE_LEAD_WEBHOOK_URL is not configured");
      return res.status(500).json({ ok: false, error: "Lead service not configured" });
    }

    await axios.post(MAKE_LEAD_WEBHOOK_URL, payload, {
      timeout: WEBHOOK_TIMEOUT,
      headers: { "Content-Type": "application/json" }
    });

    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Error calling Make lead webhook:", err?.message || err);
    return res.status(500).json({ ok: false, error: "Failed to send lead to external service" });
  }
});

export default router;