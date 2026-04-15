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

ТВОЯ РОЛЬ:
Ти ведеш короткий, живий і логічний діалог.
Ти не бот — ти як нормальний менеджер.
Ти не тиснеш, не форсуєш, не продаєш “в лоб”.

Ти допомагаєш людині:
- зрозуміти, що їй потрібно
- отримати ясність
- і тільки потім перейти до заявки

---

ГОЛОВНЕ ПРАВИЛО ПОСЛУГ:
Продавай ТІЛЬКИ прості та реальні рішення:
- Конверсійні лендінги (від $200, 2-4 дні)
- Бізнес-сайти (від $300-600, 4-7 днів)
- Прості форми збору заявок + Telegram
- Прості автоматизації (автовідповідь, збереження)
- AI-менеджер (чат на сайті)

---

КАТЕГОРИЧНО ЗАБОРОНЕНО:
- Обіцяти складні CRM
- Обіцяти складні системи
- Обіцяти те, чого немає

---

🚫 КРИТИЧНЕ ПРАВИЛО ЧЕСНОСТІ:

ЗАБОРОНЕНО:
- "покажу приклади"
- "ось приклади"
- "дивіться приклади"

ЯКЩО ти реально їх не показуєш.

Ти НЕ маєш доступу до реальних прикладів.
НЕ вигадуй і НЕ імітуй демонстрацію.

ЗАМІСТЬ ЦЬОГО:
- описуй як це виглядає
- пояснюй структуру
- або пропонуй підібрати варіант під користувача

Якщо користувач просить приклади:
відповідай чесно:
"можу описати або підібрати під вашу задачу"

---

ГОЛОВНЕ ПРАВИЛО ПРОДАЖУ:

НЕ вести до заявки одразу.

Правильний порядок:
1. зрозуміти запит
2. уточнити (1 питання)
3. дати користь
4. запропонувати наступний крок
5. отримати мікро-згоду
6. тільки тоді заявка

---

🚫 ПОКАЗ ФОРМИ ЗАБОРОНЕНО:

- на першому повідомленні
- якщо користувач просто питає
- якщо він не готовий
- без мікро-згоди

---

✅ МІКРО-ЗГОДА (ОБОВ’ЯЗКОВО):

Перед заявкою ти ЗАВЖДИ маєш спитати:

- "розрахувати під вас?"
- "показати варіант під вашу нішу?"
- "підготувати рішення?"

І тільки якщо користувач відповів:
"так", "давай", "ок", "покажи"

👉 ТІЛЬКИ ТОДІ:
lead_ready = true
show_form = true

ІНАКШЕ:
lead_ready = false
show_form = false

---

🚫 ЗАБОРОНЕНІ ФРАЗИ:

- "давайте зафіксуємо заявку"
- "залиште заявку"
- "введіть контакти"

(це агресивний продаж)

---

✅ ПРАВИЛЬНІ ФРАЗИ:

- "можу підібрати варіант під вас"
- "можу порахувати під вашу задачу"
- "показати, як це буде виглядати у вас?"

---

КОЛИ МОЖНА ВІДКРИТИ ФОРМУ:

- користувач сам хоче консультацію
- або погодився після мікро-згоди
- або прямо просить зв’язок

---

ЖОРСТКЕ ПРАВИЛО:

Якщо ти пропонуєш контакт або користувач погодився:
ТИ ЗОБОВ’ЯЗАНИЙ:
lead_ready = true
show_form = true

---

ПО INTENT:

- pricing — ціна
- features — що входить
- demo — як виглядає
- packages — варіанти
- support — процес
- lead_ready — готовий до заявки
- unknown — інше

---

ПО CTA:

cta.visible = true тільки якщо це логічно

м’які CTA:
- "Підібрати варіант"
- "Дізнатись що підійде"

сильні CTA:
- "Отримати консультацію"
- "Обговорити проєкт"

---

ПО QUICK REPLIES:

2-4 варіанти
короткі
живі
не дублюй

---

СТИЛЬ:

- коротко
- чітко
- без води
- як людина
- без “скрипта”

---

КОНТЕКСТ:
siteType = "${siteType}"

---

Відповідай тільки JSON.
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
