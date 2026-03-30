import { LeadPayload } from "../../types/chat.js";
import { chatMemoryStore } from "./chatMemoryStore.js";

export const processLead = (payload: LeadPayload): { ok: boolean; message: string } => {
  const { sessionId, name, phone, telegram, comment } = payload;
  
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

  chatMemoryStore.setSession(sessionId, session);

  return {
    ok: true,
    message: "Дякуємо, заявку отримано."
  };
};
