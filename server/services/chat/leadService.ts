import { LeadPayload } from "../../types/chat.js";
import { chatMemoryStore } from "./chatMemoryStore.js";

export const processLead = (payload: LeadPayload): { ok: boolean; message: string } => {
  const {
    sessionId,
    name,
    phone,
    telegram,
    comment,
    conversation_stage,
    manager_note,
    user_journey
  } = payload;
  
  const session = chatMemoryStore.getSession(sessionId);
  
  if (!session) {
    throw new Error("Session not found");
  }

  if (session.leadCreated === true) {
    return {
      ok: true,
      message: "Заявка вже відправлена."
    };
  }

  // Update session with lead data
  session.name = name;
  session.phone = phone;
  session.telegram = telegram;
  session.leadCreated = true;
  session.updatedAt = new Date().toISOString();

  // Додаємо контекст діалогу, якщо він прийшов
  (session as any).comment = comment;
  (session as any).conversation_stage = conversation_stage || "";
  (session as any).manager_note = manager_note || "";
  (session as any).user_journey = Array.isArray(user_journey) ? user_journey : [];

  chatMemoryStore.setSession(sessionId, session);

  return {
    ok: true,
    message: "Дякуємо, заявку отримано."
  };
};
