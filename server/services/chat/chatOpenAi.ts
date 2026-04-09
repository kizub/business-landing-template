import { GoogleGenAI, Type } from "@google/genai";
import { AssistantResponse, ChatMessage, SiteType } from "../../types/chat.js";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export const getOpenAiResponse = async (
  message: string,
  siteType: SiteType,
  sessionMessages: ChatMessage[]
): Promise<AssistantResponse> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const systemInstruction = `
Ти — AI-менеджер з продажу для бізнесу. Твоя задача — вести користувача до заявки або консультації.

ГОЛОВНЕ ПРАВИЛО ПОСЛУГ:
Продавай ТІЛЬКИ прості та реальні рішення:
- Конверсійні лендінги (від $200, 2-4 дні)
- Бізнес-сайти (від $300-600, 4-7 днів)
- Прості форми збору заявок та Telegram-сповіщення
- Прості автоматизації (авто-відповідь, збереження в базу)
- AI-менеджер (як я), який 24/7 консультує клієнтів на сайті

КАТЕГОРИЧНО ЗАБОРОНЕНО (якщо користувач сам прямо не запитав):
- Обіцяти складні CRM-системи
- Обіцяти складні інтеграції, великі системи або складні воронки
- Обіцяти те, чого немає в поточному MVP

ЖОРСТКЕ ПРАВИЛО ДЛЯ LEAD_READY ТА SHOW_FORM:
Якщо ти пропонуєш:
- "залишити заявку"
- "залишити контакти"
- "провести коротку консультацію"
- "можемо зафіксувати заявку"
- "готовий прийняти ваші контакти"
АБО якщо користувач погодився на контакт чи явно готовий перейти до контакту —
ТИ ЗОБОВ'ЯЗАНИЙ повернути:
"lead_ready": true,
"show_form": true

КОНТЕКСТ:
siteType = "${siteType}"

Ти не просто відповідаєш — ти ведеш діалог до результату. Відповідай коротко, ясно і по-ділу. Завжди повертай тільки валідний JSON.
`;

  const contents = [
    ...sessionMessages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            intent: { 
              type: Type.STRING,
              description: "pricing | features | demo | packages | support | lead_ready | unknown"
            },
            lead_ready: { type: Type.BOOLEAN },
            show_form: { type: Type.BOOLEAN },
            quick_replies: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            captured_fields: { type: Type.OBJECT },
            cta: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                visible: { type: Type.BOOLEAN }
              },
              required: ["label", "visible"]
            }
          },
          required: ["reply", "intent", "lead_ready", "show_form", "quick_replies", "cta"]
        }
      }
    });

    const content = response.text;
    if (!content) throw new Error("Empty response from Gemini");

    const parsed = JSON.parse(content) as AssistantResponse;

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
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
