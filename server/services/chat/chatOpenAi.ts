import OpenAI from "openai";
import { AssistantResponse, ChatMessage, SiteType } from "../../types/chat.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getOpenAiResponse = async (
  message: string,
  siteType: SiteType,
  sessionMessages: ChatMessage[]
): Promise<AssistantResponse> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const systemInstruction = `
    You are a sales-oriented AI manager. 
    Role: ${siteType === "portfolio" ? "Selling studio services and development." : "Demonstrating the AI chat system mechanism."}
    Rules:
    - Short answers, no fluff, no inventions.
    - One follow-up question at a time.
    - Lead the user towards a request/consultation.
    - Provide price ranges, not final prices.
    - Respond ONLY in valid JSON format.
    - Do NOT include markdown, explanations, or \`\`\`json blocks.
    - Use only these intents: "pricing", "features", "demo", "packages", "support", "lead_ready", "unknown".
    - set "show_form" to true ONLY when the user explicitly wants a consultation, contact, or to leave a request.
    - set "cta.visible" to true for most normal helpful responses.
    - default "cta.label" is "Отримати розрахунок".
  `;

  const messages: any[] = [
    { role: "system", content: systemInstruction },
    ...sessionMessages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await openai.responses.create({
      model: "gpt-5.4",
      input: messages
        .map((m) => `${m.role.charAt(0).toUpperCase() + m.role.slice(1)}: ${m.content}`)
        .join("\n"),
      text: {
        format: { type: "json_object" }
      },
    });

    const content = response.output_text;
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content) as AssistantResponse;

    if (!parsed.reply) throw new Error("Missing reply in AI response");

    return {
      reply: parsed.reply,
      intent: parsed.intent || "unknown",
      lead_ready: !!parsed.lead_ready,
      show_form: !!parsed.show_form,
      quick_replies: Array.isArray(parsed.quick_replies) ? parsed.quick_replies : [],
      captured_fields: parsed.captured_fields || {},
      cta: {
        label: parsed.cta?.label || "Отримати розрахунок",
        visible: parsed.cta?.visible !== undefined ? parsed.cta.visible : true,
      },
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      reply: "Вибачте, не вдалося обробити запит. Спробуйте ще раз.",
      intent: "unknown",
      lead_ready: false,
      show_form: false,
      quick_replies: [],
      captured_fields: {},
      cta: { label: "Отримати розрахунок", visible: true },
    };
  }
};
