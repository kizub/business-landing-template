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

  // Seed initial admin if not exists
  const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashedPassword);
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
        title: 'Будую автономні системи залучення клієнтів з фокусом на ROI',
        subtitle: 'Ваш сайт — це не просто картинка, а повноцінний відділ продажів 24/7 з миттєвою автоматизацією в Telegram та CRM.',
        primaryButtonText: 'Обговорити проєкт',
        secondaryButtonText: 'Отримати відео-розбір',
        badge1: 'Відповідаю протягом дня',
        badge2: 'Безкоштовний розбір перед стартом',
        flowLead: 'Заявка',
        flowLabel1: 'Крок 01',
        flowTelegram: 'Telegram',
        flowLabel2: 'Крок 02',
        flowCRM: 'CRM',
        flowLabel3: 'Крок 03',
        flowReminder: 'Нагадування',
        flowLabel4: 'Крок 04',
        moreButtonText: 'Докладніше про систему',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    },
    {
      key: 'about',
      content: {
        title: 'Я — архітектор систем, які приносять прибуток',
        paragraphs: [
          'Мене звати Роман. Я не просто створюю сайти, я розробляю інструменти для масштабування бізнесу. Мій підхід базується на трьох китах: маркетингова стратегія, технічна досконалість та глибока автоматизація.',
          'Замість того, щоб просто "зробити гарно", я фокусуюсь на тому, як кожна секунда перебування користувача на сайті конвертується в реальні гроші для вашого бізнесу.',
          'Працюю з проєктами будь-якої складності — від лаконічних лендінгів до складних екосистем з інтеграціями CRM, платіжних систем та кастомних ботів.'
        ],
        image: 'https://picsum.photos/seed/developer/800/1000',
        experienceValue: '5+',
        experienceLabel: 'Років досвіду',
        skills: ['React', 'TypeScript', 'Node.js', 'Framer Motion', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS', 'Webflow', 'CRM Integration']
      }
    },
    {
      key: 'cta',
      content: {
        title: 'Отримайте безкоштовний відео-аудит вашого сайту',
        subtitle: 'Я запишу 10-хвилинний розбір вашої поточної сторінки, вкажу на помилки в конверсії та запропоную 3 кроки для росту ROI.',
        buttonText: 'Замовити аудит'
      }
    },
    {
      key: 'contacts',
      content: {
        title: 'Готові побудувати систему?',
        subtitle: 'Напишіть мені, і ми обговоримо ваш проєкт вже сьогодні.',
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
        description: 'Розробка високоефективних лендінгів та систем автоматизації продажів.',
        ogTitle: 'Roman Dev - ROI Focused Systems',
        ogDescription: 'Будую автономні системи залучення клієнтів.',
        ogImage: '',
        favicon: ''
      }
    },
    {
      key: 'speed_roi',
      content: {
        title: 'Швидкість відповіді — це ваші гроші',
        subtitle: 'Дослідження показують: якщо ви відповідаєте клієнту протягом 5 хвилин, ймовірність продажу в 10 разів вища, ніж через годину.',
        statValue: '+400%',
        statLabel: 'Ріст конверсії в продаж',
        statDesc: 'при відповіді клієнту в перші 5 хвилин після заявки',
        features: [
          { title: "Миттєві сповіщення", desc: "Заявка падає в Telegram за 1 секунду після натискання кнопки." },
          { title: "Автоматизація процесів", desc: "Клієнт отримує автоматичне повідомлення або файл одразу." },
          { title: "Жодних втрачених лідів", desc: "Всі контакти зберігаються в базі, а не губляться в пошті." }
        ]
      }
    }
  ];

  for (const section of sections) {
    const exists = db.prepare('SELECT * FROM site_content WHERE section_key = ?').get(section.key);
    if (!exists) {
      db.prepare('INSERT INTO site_content (section_key, content_json) VALUES (?, ?)').run(section.key, JSON.stringify(section.content));
    }
  }

  // Seed cases
  const casesCount = db.prepare('SELECT COUNT(*) as count FROM cases').get() as { count: number };
  if (casesCount.count === 0) {
    const initialCases = [
      {
        niche: "Юридичні послуги",
        title: "Система залучення клієнтів для адвокатського бюро",
        image: "https://picsum.photos/seed/legal/800/600",
        problem: "Багато трафіку, але низька якість заявок.",
        detailed_problem: "Клієнт витрачав понад $2000 на місяць на Google Ads, але отримував лише 5-7 нецільових дзвінків. Відвідувачі не розуміли спеціалізацію бюро та швидко йшли з сайту.",
        detailed_solution: "Ми провели аналіз конкурентів та виділили ключові переваги. Створили структуру квізу, яка відсіює нецільових клієнтів на етапі опитування. Змінили оффер на 'Безкоштовний розрахунок ризиків вашої справи'.",
        solution: "Перероблена структура квізу та зміна офферу на безкоштовну консультацію.",
        result: "Збільшення конверсії у 2.5 рази, заявки стали більш цільовими.",
        link: "https://example.com/case1"
      },
      {
        niche: "Магазин меблів",
        title: "E-commerce трансформація для локального виробника",
        image: "https://picsum.photos/seed/furniture/800/600",
        problem: "Клієнти дивляться каталог, але не залишають контакти.",
        detailed_problem: "Сайт виглядав як статична галерея. Користувачі переглядали фото, але не мали стимулу залишити номер телефону або зробити замовлення онлайн.",
        detailed_solution: "Впровадили інтерактивний конструктор кухні. Додали лід-магніт 'Гайд з вибору матеріалів для меблів'. Інтегрували Telegram-бота, який автоматично надсилає прайс-лист після заявки.",
        solution: "Додано лід-магніт та інтегровано Telegram-бота для швидкої відповіді.",
        result: "Збір бази потенційних клієнтів зріс на 40%.",
        link: "https://example.com/case2"
      },
      {
        niche: "IT-курси",
        title: "Landing Page для школи програмування",
        image: "https://picsum.photos/seed/it/800/600",
        problem: "Складна послуга, яку важко пояснити на сайті.",
        detailed_problem: "Потенційні студенти не розуміли програму навчання та перспективи працевлаштування. Конверсія у запис на пробний урок була нижче 1%.",
        detailed_solution: "Розробили лонгрід з чітким візуальним планом навчання. Додали блок з реальними відео-відгуками випускників. Створили UX-оптимізовану форму запису з мінімальною кількістю полів.",
        solution: "Створено лонгрід з відео-відгуками та покроковим планом навчання.",
        result: "Зниження вартості ліда на 30% за рахунок кращого прогріву.",
        link: "https://example.com/case3"
      }
    ];

    const insertCase = db.prepare(`
      INSERT INTO cases (niche, title, image, problem, detailed_problem, detailed_solution, solution, result, link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of initialCases) {
      insertCase.run(c.niche, c.title, c.image, c.problem, c.detailed_problem, c.detailed_solution, c.solution, c.result, c.link);
    }
  }

  // Seed pricing
  const pricingCount = db.prepare('SELECT COUNT(*) as count FROM pricing_plans').get() as { count: number };
  if (pricingCount.count === 0) {
    const initialPlans = [
      {
        name: "СИСТЕМА СТАРТ",
        price: "$400",
        label: "Для швидкого старту",
        featured: 0,
        features_json: JSON.stringify(["Лендінг", "Аналіз конкурентів", "Дизайн + Копірайтинг", "Telegram сповіщення", "Адаптив під мобільні"]),
        result_text: "Автономний лендінг для перших продажів"
      },
      {
        name: "БІЗНЕС ДВИГУН",
        price: "$650",
        label: "Найчастіше обирають",
        featured: 1,
        features_json: JSON.stringify(["Все з Тарифу Старт", "Глибока стратегія", "Складна автоматизація", "Інтеграція з CRM", "Налаштування аналітики", "A/B тестування"]),
        result_text: "Повноцінна система генерації та обробки лідів"
      },
      {
        name: "ПРО АРХІТЕКТОР",
        price: "$1000+",
        label: "Максимум результату",
        featured: 0,
        features_json: JSON.stringify(["Все з Тарифу Двигун", "Повна воронка продажів", "Email/SMS маркетинг", "UX-оптимізація", "Супровід 1 місяць", "Пріоритетна підтримка"]),
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
  }

  // Seed process
  const processCount = db.prepare('SELECT COUNT(*) as count FROM process_steps').get() as { count: number };
  if (processCount.count === 0) {
    const initialSteps = [
      { number: "01", title: "Аналіз та стратегія", desc: "Вивчаю ваш продукт, конкурентів та шлях клієнта. Формуємо оффер, від якого неможливо відмовитись." },
      { number: "02", title: "Архітектура системи", desc: "Проєктую структуру лендінгу та логіку автоматизації. Кожен блок має свою маркетингову ціль." },
      { number: "03", title: "Дизайн та розробка", desc: "Створюю сучасний, швидкий та адаптивний інтерфейс, який підкреслює експертність вашого бренду." },
      { number: "04", title: "Запуск та оптимізація", desc: "Підключаю аналітику, CRM та Telegram-ботів. Тестуємо систему та виводимо на планові показники ROI." }
    ];
    const insertStep = db.prepare('INSERT INTO process_steps (step_number, title, description) VALUES (?, ?, ?)');
    for (const s of initialSteps) {
      insertStep.run(s.number, s.title, s.desc);
    }
  }

  // Seed problems
  const problemsCount = db.prepare('SELECT COUNT(*) as count FROM problem_cards').get() as { count: number };
  if (problemsCount.count === 0) {
    const initialProblems = [
      { title: "Люди заходять і йдуть без заявки", desc: "Ви витрачаєте бюджет на рекламу, але відвідувачі не розуміють цінності та закривають вкладку." },
      { title: "Клієнти купують у тих, хто відповідає швидше", desc: "Ваш сайт не інтегрований з CRM, і ви втрачаєте ліди через довгу обробку заявок." },
      { title: "Сайт виглядає нормально, але не продає", desc: "Гарний дизайн без маркетингової структури — це просто картинка, а не інструмент бізнесу." }
    ];
    const insertProblem = db.prepare('INSERT INTO problem_cards (title, description) VALUES (?, ?)');
    for (const p of initialProblems) {
      insertProblem.run(p.title, p.desc);
    }
  }

  // Seed benefits
  const benefitsCount = db.prepare('SELECT COUNT(*) as count FROM benefit_cards').get() as { count: number };
  if (benefitsCount.count === 0) {
    const initialBenefits = [
      { icon: "Layout", title: "Структура і тексти", result: "Ведуть клієнта до заявки, а не просто показують інформацію" },
      { icon: "Zap", title: "Швидкість", result: "Сайт завантажується швидко і не дає користувачу піти" },
      { icon: "MessageSquare", title: "Заявки без втрат", result: "Контакти одразу потрапляють у Telegram або CRM" }
    ];
    const insertBenefit = db.prepare('INSERT INTO benefit_cards (icon_name, title, result) VALUES (?, ?, ?)');
    for (const b of initialBenefits) {
      insertBenefit.run(b.icon, b.title, b.result);
    }
  }

  // Seed FAQ
  const initialFaq = [
    { q: "Скільки часу займає розробка?", a: "Зазвичай від 7 до 14 днів, залежно від складності системи та швидкості зворотного зв'язку." },
    { q: "Чи потрібна мені CRM?", a: "Якщо у вас більше 5 заявок на день — так. Я допоможу обрати та інтегрувати оптимальне рішення." },
    { q: "Які гарантії результату?", a: "Я гарантую технічну якість та відповідність маркетинговій стратегії. ROI залежить також від вашого відділу продажів та якості трафіку." },
    { q: "Чи можна редагувати контент самому?", a: "Так, я надаю зручну адмін-панель, де ви зможете змінювати тексти, ціни та кейси без програміста." },
    { q: "Яка вартість підтримки після запуску?", a: "Перший місяць підтримки безкоштовний. Далі ми можемо домовитись про разові оновлення або щомісячний супровід." },
    { q: "Чи працюєте ви з іноземними ринками?", a: "Так, я маю досвід розробки англомовних лендінгів для ринків США та Європи." },
    { q: "Які платформи ви використовуєте?", a: "Я розробляю кастомні рішення на React/Node.js для максимальної швидкості, або Webflow для проектів, де клієнту важливо самому легко змінювати дизайн." },
    { q: "Чи допомагаєте ви з налаштуванням реклами?", a: "Я фокусуюсь на конверсії сайту, але можу порекомендувати перевірених партнерів з налаштування Google Ads та Facebook/Instagram реклами." }
  ];

  const checkFaq = db.prepare('SELECT id FROM faq WHERE question = ?');
  const insertFaq = db.prepare('INSERT INTO faq (question, answer) VALUES (?, ?)');

  for (const f of initialFaq) {
    const exists = checkFaq.get(f.q);
    if (!exists) {
      console.log(`Seeding FAQ: ${f.q}`);
      insertFaq.run(f.q, f.a);
    } else {
      console.log(`FAQ already exists: ${f.q}`);
    }
  }
}

export default db;
