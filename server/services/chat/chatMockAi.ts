import { AssistantResponse, ChatIntent, SiteType } from "../../types/chat.js";

export const getMockAiResponse = (message: string, siteType: SiteType): AssistantResponse => {
  const msg = message.toLowerCase();
  const isDemo = siteType === "demo";
  
  if (msg.includes("ціна") || msg.includes("вартість") || msg.includes("скільки коштує")) {
    return {
      reply: isDemo 
        ? "У цій демо-системі ви можете побачити, як AI автоматично відповідає на питання про ціни. У реальному проекті ціни підтягуються з вашої бази даних або CRM."
        : "Вартість розробки залежить від складності та функціоналу. Орієнтовно: лендінг від $500, корпоративний сайт від $1000, складні системи з AI від $2500. Який формат вас цікавить?",
      intent: "pricing",
      lead_ready: false,
      show_form: false,
      quick_replies: ["Просто сайт", "Сайт + заявки", "Сайт + AI"],
      captured_fields: { service_interest: "website" },
      cta: { label: "Отримати розрахунок", visible: true }
    };
  }

  if (msg.includes("що входить") || msg.includes("що в пакеті") || msg.includes("функції")) {
    return {
      reply: isDemo
        ? "Це демонстрація того, як бот розповідає про ваші послуги. Ви можете налаштувати будь-який список функцій у панелі керування."
        : "У кожен пакет входить: адаптивний дизайн, базова SEO-оптимізація, панель управління та інтеграція аналітики. Додатково можна підключити AI-асистента та CRM.",
      intent: "features",
      lead_ready: false,
      show_form: false,
      quick_replies: ["Показати пакети", "Потрібна адмінка", "Потрібна автоматизація"],
      captured_fields: {},
      cta: { label: "Детальніше", visible: true }
    };
  }

  if (msg.includes("консультація") || msg.includes("хочу зв'язок") || msg.includes("залишити заявку")) {
    return {
      reply: isDemo
        ? "Демонстрація форми збору лідів. У реальній системі ці дані миттєво потрапляють у ваш Telegram або CRM."
        : "З радістю допоможу! Залиште ваші контакти, і ми обговоримо ваш проект детальніше.",
      intent: "lead_ready",
      lead_ready: true,
      show_form: true,
      quick_replies: [],
      captured_fields: {},
      cta: { label: "Надіслати заявку", visible: true }
    };
  }

  return {
    reply: isDemo
      ? "Ви тестуєте демонстраційну версію AI-чату. Спробуйте запитати про ціну або функції, щоб побачити, як працює система."
      : "Я ваш AI-менеджер. Допоможу розібратися з послугами, зорієнтую по цінах та розкажу про можливості автоматизації вашого бізнесу.",
    intent: "unknown",
    lead_ready: false,
    show_form: false,
    quick_replies: ["Скільки коштує?", "Що ви робите?", "Хочу консультацію"],
    captured_fields: {},
    cta: { label: "Отримати розрахунок", visible: true }
  };
};
