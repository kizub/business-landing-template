import { ChatMessagePayload, ChatSession, AssistantResponse } from "../../types/chat.js";
import { chatMemoryStore } from "./chatMemoryStore.js";
import { getOpenAiResponse } from "./chatOpenAi.js";

export const processChatMessage = async (payload: ChatMessagePayload): Promise<AssistantResponse> => {
  const { sessionId, message, siteType, pageUrl, timestamp, quickAction } = payload;
  const MAX_MESSAGES = 12;
  const effectiveMessage = quickAction || message;
  
  let session = chatMemoryStore.getSession(sessionId);
  
  if (!session) {
    session = {
      sessionId,
      siteType,
      entryPage: pageUrl,
      lastPage: pageUrl,
      leadCreated: false,
      intent: "unknown",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else {
    session.lastPage = pageUrl;
    session.updatedAt = new Date().toISOString();
  }

  // Get AI response using previous messages only
  const sessionMessages = [...session.messages];

  // Add current user message to session
  session.messages.push({
    role: "user",
    text: effectiveMessage,
    createdAt: timestamp || new Date().toISOString()
  });

  // Get AI response
  let aiResponse = await getOpenAiResponse(effectiveMessage, siteType, sessionMessages);

  // Fallback if response is invalid
  if (!aiResponse || !aiResponse.reply) {
    aiResponse = {
      reply: "Вибачте, не вдалося обробити запит. Спробуйте ще раз.",
      intent: "unknown",
      lead_ready: false,
      show_form: false,
      quick_replies: [],
      captured_fields: {},
      conversation_stage: "unknown",
      manager_note: "",
      user_journey: [],
      cta: { label: "Отримати розрахунок", visible: true }
    };
  }

  // Update session with AI findings
  session.intent = aiResponse.intent;

  if (aiResponse.captured_fields) {
    if (aiResponse.captured_fields.service_interest) {
      session.serviceInterest = aiResponse.captured_fields.service_interest;
    }
  }

  // Зберігаємо AI-контекст у session
  (session as any).conversation_stage = aiResponse.conversation_stage || "unknown";
  (session as any).manager_note = aiResponse.manager_note || "";
  (session as any).user_journey = Array.isArray(aiResponse.user_journey) ? aiResponse.user_journey : [];

  // Add assistant message
  session.messages.push({
    role: "assistant",
    text: aiResponse.reply,
    createdAt: new Date().toISOString()
  });

  // Limit messages
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
  }

  session.updatedAt = new Date().toISOString();
  chatMemoryStore.setSession(sessionId, session);

  return aiResponse;
};

