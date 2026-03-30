import { Router, Request, Response } from "express";
import { processChatMessage } from "../services/chat/chatSessionService.js";
import { processLead } from "../services/chat/leadService.js";
import { ChatMessagePayload, LeadPayload } from "../types/chat.js";

const router = Router();

// POST /api/chat/message
router.post("/message", async (req: Request, res: Response) => {
  try {
    const payload = req.body as ChatMessagePayload;

    // Validation
    if (!payload.sessionId) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }
    if (!payload.message || payload.message.trim() === "") {
      return res.status(400).json({ ok: false, error: "message is required" });
    }
    if (payload.message.length > 1000) {
      return res.status(400).json({ ok: false, error: "message too long" });
    }
    if (payload.siteType !== "portfolio" && payload.siteType !== "demo") {
      return res.status(400).json({ ok: false, error: "invalid siteType" });
    }

    const aiResponse = await processChatMessage(payload);

    return res.json({
      ok: true,
      data: aiResponse
    });
  } catch (error: any) {
    console.error("Chat message error:", error);
    if (error.message === "OPENAI_API_KEY is not configured") {
      return res.status(500).json({ ok: false, error: "AI service not configured" });
    }
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/chat/lead
router.post("/lead", (req: Request, res: Response) => {
  try {
    const payload = req.body as LeadPayload;

    // Validation
    if (!payload.sessionId) {
      return res.status(400).json({ ok: false, error: "sessionId is required" });
    }
    if (!payload.phone && !payload.telegram) {
      return res.status(400).json({ ok: false, error: "phone or telegram is required" });
    }

    const result = processLead(payload);

    return res.json(result);
  } catch (error: any) {
    console.error("Chat lead error:", error);
    if (error.message === "Session not found") {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;
