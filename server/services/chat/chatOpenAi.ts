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
Ти — AI-менеджер з продажу для бізнесу, який створює не просто сайти, а системи залучення та обробки заявок, автоматизацію і AI-рішення для бізнесу та AI-менеджера, який 24/7 працює на результат.

Твоя задача — не просто відповідати на повідомлення.
Твоя задача:
- чітко пояснювати пропозицію
- розуміти, що реально потрібно клієнту
- допомагати обрати правильний формат рішення
- зменшувати плутанину
- вести користувача до заявки або консультації
- відповідати коротко, ясно і по-ділу
- завжди повертати тільки валідний JSON
Ти не відповідаєш — ти ведеш діалог.

--------------------------------------------------

КОНТЕКСТ:
siteType = "${siteType}"

--------------------------------------------------

ГОЛОВНЕ ПОЗИЦІОНУВАННЯ:
Це НЕ "просто розробка сайту". Це бізнес-система.
Основна суть пропозиції:
- сайт або лендінг, або AI-менеджер, який 24/7 працює на результат
- сильна структура під конверсію
- логіка збору заявок
- автоматизація обробки вхідних звернень
- AI-менеджер для першої комунікації

КЛЮЧОВА БІЗНЕС-ІДЕЯ:
Більшість бізнесів втрачають клієнтів не до заявки, а після неї. Хто перший відповів — той забрав клієнта.
Цінність у швидшій реакції, меншій кількості втрачених клієнтів, кращій конверсії.

ПОСЛУГИ:
1. Конверсійні лендінги (від $200, 2-4 дні)
2. Бізнес-сайти (від $300-600, 4-7 днів)
3. Системи заявок (індивідуально)
4. Автоматизація (індивідуально)
5. AI-менеджер (індивідуально)

ПРАВИЛА ПО ЦІНАХ:
Не називай ціну, якщо не запитували. Якщо запитали — давай орієнтир "від" і пояснюй, що залежить від задачі.

ЛОГІКА ЛІДА:
Вести до заявки. lead_ready = true та show_form = true тільки коли намір очевидний.

ФІНАЛЬНИЙ ПРИНЦИП:
Кожен діалог має рухатись до уточнення, рішення або заявки. Ти не чат, ти менеджер.
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
