import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.sqlite');

let db: Database.Database;

try {
  db = new Database(dbPath);
} catch (error: any) {
  if (error.code === 'SQLITE_CORRUPT') {
    console.error('Database file is malformed. Deleting and recreating...');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    db = new Database(dbPath);
  } else {
    throw error;
  }
}

// Initialize tables
export function initDb() {
  try {
    console.log('Initializing database...');
    // Users table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

  // Site content table (for simple sections)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT UNIQUE NOT NULL,
      content_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Cases table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      niche TEXT NOT NULL,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      problem TEXT NOT NULL,
      detailed_problem TEXT NOT NULL,
      detailed_solution TEXT NOT NULL,
      solution TEXT NOT NULL,
      result TEXT NOT NULL,
      link TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Pricing plans table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      label TEXT NOT NULL,
      featured INTEGER DEFAULT 0,
      features_json TEXT NOT NULL,
      result_text TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Process steps table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS process_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_number TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `).run();

  // Problem cards table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS problem_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `).run();

  // Benefit cards table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS benefit_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      icon_name TEXT NOT NULL,
      title TEXT NOT NULL,
      result TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `).run();

  // FAQ table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Leads table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      message TEXT,
      plan TEXT,
      source TEXT,
      status TEXT DEFAULT 'new', -- new, contacted, closed
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Articles table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      category TEXT,
      is_published INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Seed initial admin from environment variables or defaults
  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  // Ensure the environment-defined admin exists
  const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get(envUsername) as any;
  const hashedPassword = bcrypt.hashSync(envPassword, 10);
  
  if (!adminExists) {
    db.prepare('INSERT OR REPLACE INTO users (username, password) VALUES (?, ?)').run(envUsername, hashedPassword);
    console.log(`Admin user '${envUsername}' ensured in database.`);
  } else {
    db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hashedPassword, envUsername);
    console.log(`Password for '${envUsername}' updated from environment.`);
  }

  // Fallback: Also ensure 'admin' exists with 'admin123' if it's different from env
  if (envUsername !== 'admin') {
    const fallbackExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;
    const fallbackHash = bcrypt.hashSync('admin123', 10);
    if (!fallbackExists) {
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', fallbackHash);
    } else {
      db.prepare('UPDATE users SET password = ? WHERE username = ?').run(fallbackHash, 'admin');
    }
    console.log("Fallback admin 'admin' with 'admin123' also ensured.");
  }

  seedInitialContent();
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
}

function seedInitialContent() {
  // Seed site_content
  const sections = [
    {
      key: 'hero',
      content: {
        title: 'Будую автономні системи , які перетворюють трафік  у гроші',
        subtitle: 'Ви вже платите за рекламу. Ви вже отримуєте переходи на сайт. Але питання не в трафіку. Питання в тому, що відбувається після кліку.\n\nУ більшості випадків сайт:\n— не пояснює цінність\n— не веде до дії\n— не обробляє заявку\n— і просто “зливає” потенційного клієнта\n\nЯ створюю системи, які працюють інакше.\n\nЦе не просто сайт. Це повноцінна система, яка:\n— приймає заявки\n— одразу надсилає їх у Telegram\n— зберігає всі контакти в базі\n— нагадує вам про клієнта, якщо ви не відповіли\n— і допомагає довести його до продажу\n\nПлюс: ви отримуєте окрему адмін-панель, де можете самостійно змінювати тексти, фото, відео і блоки без участі розробника.',
        primaryButtonText: 'Обговорити проект',
        secondaryButtonText: 'Отримати відео-розбір',
        badge1: '✔ Відповідаю протягом 15 хвилин',
        badge2: '✔ Безкоштовний розбір перед стартом',
        flowLead: 'Заявка',
        flowLabel1: 'Крок 01',
        flowTelegram: 'Telegram',
        flowLabel2: 'Крок 02',
        flowCRM: 'CRM',
        flowLabel3: 'Крок 03',
        flowReminder: 'Нагадування',
        flowLabel4: 'Крок 04',
        moreButtonText: 'Докладніше про систему',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        readMoreLabel: 'докладніше',
        collapseLabel: 'згорнути'
      }
    },
    {
      key: 'about',
      content: {
        title: 'Я створюю системи, а не просто сайти',
        paragraphs: [
          'Мене звати Роман. Я займаюсь не дизайном заради дизайну, а створенням інструментів, які реально впливають на прибуток бізнесу.',
          'Мій підхід базується на трьох речах: маркетинг, логіка поведінки клієнта, автоматизація. Кожен сайт, який я роблю, має одну задачу — перетворювати відвідувачів у клієнтів.'
        ],
        image: '/roman-photo.jpg',
        experienceValue: '5+',
        experienceLabel: 'Років досвіду',
        skills: ['React', 'TypeScript', 'Node.js', 'Framer Motion', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS', 'Webflow', 'Автоматизація', 'UX/UI Дизайн', 'CRM Integration', 'Telegram Bots']
      }
    },
    {
      key: 'cta',
      content: {
        title: 'Отримайте безкоштовний відео-аудит вашого сайту',
        subtitle: 'Я подивлюсь вашу сторінку і покажу: де ви втрачаєте клієнтів, що саме не працює, як це виправити. Це не загальні поради — це конкретні кроки під ваш бізнес.',
        buttonText: 'Отримати розбір',
        additionalText: '*Консультація безкоштовна. Це вас ні до чого не зобов\'язує.'
      }
    },
    {
      key: 'contacts',
      content: {
        title: 'Готові почати заробляти більше?',
        subtitle: 'Напишіть мені — і ми розберемо ваш проект вже сьогодні. Ви отримаєте цінні знання, незалежно від того, чи будемо ми працювати разом вподальшому',
        email: 'kizub888@gmail.com',
        telegram: '@Kizub_BRB',
        formNameLabel: 'Ім’я',
        formContactLabel: 'Телефон / Email',
        formMessageLabel: 'Повідомлення',
        formButtonText: 'Надіслати запит'
      }
    },
    {
      key: 'footer',
      content: {
        copyright: '© 2026 Roman Dev. Всі права захищені.',
        telegramLink: 'https://t.me/Kizub_BRB'
      }
    },
    {
      key: 'seo',
      content: {
        title: 'Roman Dev | Автономні системи залучення клієнтів',
        description: 'Будую автономні системи залучення клієнтів, які перетворюють трафік у стабільний потік заявок і продажів.',
        ogTitle: 'Roman Dev - Системи залучення клієнтів',
        ogDescription: 'Перетворюйте трафік у стабільний потік заявок.',
        ogImage: '',
        favicon: ''
      }
    },
    {
      key: 'speed_roi',
      content: {
        title: 'ШВИДКІСТЬ = ГРОШІ',
        subtitle: 'Швидкість відповіді безпосередньо впливає на прибуток. Є проста закономірність: чим швидше ви відповідаєте — тим більша ймовірність продажу.',
        statValue: '+400%',
        statLabel: 'Ріст конверсії в продаж',
        statDesc: 'при відповіді клієнту в перші 5 хвилин',
        features: [
          { title: "✔ Автоматизація", desc: "✔ заявка приходить одразу ✔ Telegram сповіщення ✔ авто-відповідь ✔ нагадування" },
          { title: "✔ Переваги", desc: "✔ не втрачаєте клієнтів ✔ швидше за конкурентів ✔ ріст конверсії" },
          { title: "✔ Результат", desc: "✔ Стабільний потік заявок без зливу бюджету" }
        ],
        calcTitle: 'Скільки грошей ви реально втрачаєте щомісяця?',
        calcDesc: 'Більшість бізнесів навіть не рахують це. Але різниця між 1% і 5% конверсії — це не “трохи більше”, це різниця в кілька разів по доходу.',
        example: 'Наприклад: при тому ж трафіку ви можете отримувати в 2–5 разів більше заявок без збільшення бюджету на рекламу.',
        labelTraffic: 'Трафік (відвідувачів / міс.)',
        labelConversion: 'Конверсія (%)',
        labelCheck: 'Середній чек (грн)',
        labelCurrentRevenue: 'Поточний дохід:',
        labelPotentialRevenue: 'Потенціал (при 5% конверсії):',
        labelLostProfit: 'Ваша недоотримана вигода:'
      }
    },
    {
      key: 'problems_header',
      content: {
        title: 'Проблеми, які ми вирішуємо',
        subtitle: 'Якщо ваш сайт просто “висить” в інтернеті — він не працює. Ось що ми виправляємо.'
      }
    },
    {
      key: 'benefits_header',
      content: {
        title: 'Чому це працює краще за звичайний сайт',
        subtitle: 'Ми не просто малюємо картинки. Ми будуємо логіку, яка веде клієнта до покупки.'
      }
    },
    {
      key: 'cases_header',
      content: {
        title: 'Результати, які можна виміряти в грошах',
        subtitle: 'Кейси, де ми впровадили систему і вивели бізнес на новий рівень.',
        visitSiteLabel: 'Відвідати сайт',
        visitSiteHint: 'Натисніть, щоб побачити результат наживо',
        problemLabel: 'Проблема',
        solutionLabel: 'Рішення',
        resultLabel: 'Результат',
        closeModalLabel: 'Закрити вікно',
        moreDetailsLabel: 'Дивитись детальніше'
      }
    },
    {
      key: 'process_header',
      content: {
        title: 'Як ми будуємо вашу систему',
        subtitle: 'Від першого дзвінка до стабільного потоку заявок — всього 6 кроків.',
        stepLabel: 'Крок'
      }
    },
    {
      key: 'pricing_header',
      content: {
        title: 'Оберіть свій рівень масштабування',
        subtitle: 'Ми підберемо рішення під ваші задачі: від швидкого старту до повного захоплення ринку.',
        resultLabel: 'Результат:',
        selectPlanLabel: 'Обрати цей формат'
      }
    },
    {
      key: 'faq_header',
      content: {
        title: 'Часті запитання',
        subtitle: 'Відповіді на те, що зазвичай цікавить моїх клієнтів.'
      }
    }
  ];

  for (const section of sections) {
    db.prepare('INSERT OR REPLACE INTO site_content (section_key, content_json) VALUES (?, ?)').run(section.key, JSON.stringify(section.content));
  }

  // Seed cases
  db.prepare('DELETE FROM cases').run();
  const initialCases = [
    {
      niche: "Адвокатське бюро",
      title: "Система для адвокатського бюро",
      image: "https://picsum.photos/seed/legal/800/600",
      problem: "багато переходів, але мало заявок",
      detailed_problem: "Сайт мав багато відвідувачів з реклами, але конверсія в заявку була критично низькою. Бюджет витрачався, але клієнти не залишали контакти.",
      detailed_solution: "— змінили структуру сайту\n— переписали тексти\n— додали логіку дій\n— підключили обробку заявок",
      solution: "Повна перебудова воронки та копірайтингу.",
      result: "— збільшення кількості заявок\n— стабільний потік клієнтів\n— без збільшення бюджету",
      link: "https://example.com/case1"
    },
    {
      niche: "Будівництво",
      title: "Знизили вартість ліда в 3.75 рази",
      image: "https://picsum.photos/seed/construction/800/600",
      problem: "Висока вартість залучення клієнта.",
      detailed_problem: "Клієнт витрачав великі бюджети на рекламу, але вартість одного ліда була занадто високою для рентабельності бізнесу.",
      detailed_solution: "Впровадили систему з квізом та автоматизацією, що дозволило краще сегментувати аудиторію та знизити вартість ліда.",
      solution: "Впровадження квіз-системи та оптимізація офферу.",
      result: "Вартість ліда впала з 450 грн до 120 грн.",
      link: "https://example.com/case2"
    }
  ];

  const insertCase = db.prepare(`
    INSERT INTO cases (niche, title, image, problem, detailed_problem, detailed_solution, solution, result, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of initialCases) {
    insertCase.run(c.niche, c.title, c.image, c.problem, c.detailed_problem, c.detailed_solution, c.solution, c.result, c.link);
  }

  // Seed pricing
  db.prepare('DELETE FROM pricing_plans').run();
  const initialPlans = [
    {
      name: "від 400$",
      price: "Старт",
      label: "для швидкого старту",
      featured: 0,
      features_json: JSON.stringify(["Лендінг", "Аналіз конкурентів", "Дизайн + Копірайтинг", "Telegram сповіщення", "Адаптив під мобільні"]),
      result_text: "Швидкий запуск для перевірки ніші та отримання лідів"
    },
    {
      name: "від 650$",
      price: "Бізнес",
      label: "Генерація та обробка",
      featured: 1,
      features_json: JSON.stringify(["Все з Тарифу Старт", "Глибока стратегія", "Складна автоматизація", "Інтеграція з CRM", "Налаштування аналітики", "A/B тестування"]),
      result_text: "Повноцінна система генерації та обробки лідів"
    },
    {
      name: "від 1000$",
      price: "Про",
      label: "бізнес-система",
      featured: 0,
      features_json: JSON.stringify(["Все з Тарифу Бізнес", "Повна воронка продажів", "Email/SMS маркетинг", "UX-оптимізація", "Супровід 1 місяць", "Пріоритетна підтримка"]),
      result_text: "Масштабована бізнес-система під ключ"
    }
  ];

  const insertPlan = db.prepare(`
    INSERT INTO pricing_plans (name, price, label, featured, features_json, result_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const p of initialPlans) {
    insertPlan.run(p.name, p.price, p.label, p.featured, p.features_json, p.result_text);
  }

  // Seed process
  db.prepare('DELETE FROM process_steps').run();
  const initialSteps = [
    { number: "01", title: "Аналіз", desc: "Ми детально розбираємо: ваш продукт, конкурентів, як зараз приходять клієнти, де ви втрачаєте гроші." },
    { number: "02", title: "Стратегія і структура", desc: "Будуємо логіку сайту: що бачить клієнт, як він рухається, де приймає рішення." },
    { number: "03", title: "Копірайтинг і прототип", desc: "Пишемо тексти, які продають, і створюємо чорновий варіант системи." },
    { number: "04", title: "Дизайн і розробка", desc: "Створюємо візуальну частину, яка підкреслює вашу експертність, та програмуємо систему." },
    { number: "05", title: "Автоматизація", desc: "Підключаємо Telegram, CRM, налаштовуємо сповіщення та нагадування." },
    { number: "06", title: "Запуск і підтримка", desc: "Запускаємо систему, тестуємо і супроводжуємо перший місяць." }
  ];

  const insertStep = db.prepare(`
    INSERT INTO process_steps (step_number, title, description)
    VALUES (?, ?, ?)
  `);
  for (const s of initialSteps) {
    insertStep.run(s.number, s.title, s.desc);
  }

  // Seed problems
  db.prepare('DELETE FROM problem_cards').run();
  const initialProblems = [
    { title: "Люди заходять на сайт і йдуть", desc: "Користувач відкриває сторінку і за 3–5 секунд вирішує — залишатися чи ні. Якщо він не розуміє цінність — він просто закриває вкладку. І кожен такий перехід — це ваші гроші." },
    { title: "Ви втрачаєте заявки після їх отримання", desc: "Якщо ви відповідаєте через 30–60 хв або заявка 'загубилась' — клієнт уже пішов до конкурента. Навіть гарячий лід остигає миттєво." },
    { title: "Сайт не виконує функцію продажу", desc: "Більшість сайтів — це просто 'вітрина'. Вони виглядають нормально, але не ведуть до дії і не працюють як система. У результаті — немає стабільних заявок." }
  ];
  const insertProblem = db.prepare('INSERT INTO problem_cards (title, description) VALUES (?, ?)');
  for (const p of initialProblems) {
    insertProblem.run(p.title, p.desc);
  }

  // Seed benefits
  db.prepare('DELETE FROM benefit_cards').run();
  const initialBenefits = [
    { icon: "Layout", title: "Продумана структура", result: "Ми будуємо логіку: що бачить людина, що вона думає і чому вона залишає заявку." },
    { icon: "Zap", title: "Швидкість і простота", result: "Сайт завантажується миттєво і не перевантажує користувача. Все максимально зрозуміло." },
    { icon: "MessageSquare", title: "Повна обробка заявок", result: "Заявка в Telegram, збереження в системі та автоматичні нагадування." }
  ];
  const insertBenefit = db.prepare('INSERT INTO benefit_cards (icon_name, title, result) VALUES (?, ?, ?)');
  for (const b of initialBenefits) {
    insertBenefit.run(b.icon, b.title, b.result);
  }

  // Seed FAQ
  db.prepare('DELETE FROM faq').run();
  const initialFaq = [
    { q: "Скільки часу займає розробка?", a: "Зазвичай від 7 до 14 днів. Точний термін залежить від складності задачі і швидкості зворотного зв’язку з вашого боку." },
    { q: "Чи потрібна мені CRM?", a: "Так, якщо ви хочете не втрачати заявки. Без CRM частина клієнтів просто губиться — особливо якщо заявок стає більше." },
    { q: "Чи можна редагувати сайт самостійно?", a: "Так. Ви отримуєте адмін-панель, де можете змінювати тексти, фото, блоки і контент без розробника." },
    { q: "Що відбувається після заявки?", a: "Заявка одразу приходить у Telegram. Вона також зберігається в системі. Якщо ви не відповідаєте — приходить нагадування." },
    { q: "Чи допомагаєте з рекламою?", a: "Так. Можу або налаштувати базово, або дати чіткі рекомендації, щоб сайт почав приносити заявки." },
    { q: "Чи буде сайт показуватись у Google?", a: "Так. Сайт одразу оптимізується під пошук: правильна структура, індексація, підключення аналітики." },
    { q: "Чи є гарантія результату?", a: "Я працюю не просто “щоб зробити сайт”, а щоб система почала приносити заявки." }
  ];

  const insertFaq = db.prepare('INSERT INTO faq (question, answer) VALUES (?, ?)');
  for (const f of initialFaq) {
    insertFaq.run(f.q, f.a);
  }
}

export default db;
