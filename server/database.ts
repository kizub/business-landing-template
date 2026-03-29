import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.sqlite');
const DATABASE_URL = process.env.DATABASE_URL;
const IS_PROD = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;

// ВАЛІДАЦІЯ СЕРЕДОВИЩА: Попередження про SQLite в production
if (IS_PROD && !DATABASE_URL) {
  console.error('\x1b[31m%s\x1b[0m', '!!! КРИТИЧНЕ ПОПЕРЕДЖЕННЯ: Ви використовуєте SQLite в PRODUCTION середовищі (Cloud Run).');
  console.error('\x1b[31m%s\x1b[0m', '!!! Ваші дані БУДУТЬ ВИДАЛЕНІ після кожного перезапуску або деплою.');
  console.error('\x1b[31m%s\x1b[0m', '!!! Будь ласка, встановіть DATABASE_URL для підключення до PostgreSQL.');
}

export interface DbInterface {
  query: (text: string, params?: any[]) => Promise<any>;
  get: (text: string, params?: any[]) => Promise<any>;
  all: (text: string, params?: any[]) => Promise<any[]>;
  run: (text: string, params?: any[]) => Promise<{ lastInsertRowid: number | string; changes: number }>;
  isPostgres: boolean;
}

let sqliteDb: Database.Database | null = null;
let pgPool: pkg.Pool | null = null;

// Ініціалізація підключення
if (DATABASE_URL) {
  console.log('PostgreSQL URL detected. Initializing connection pool...');
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Для міграції: пробуємо відкрити SQLite, якщо файл існує
  if (fs.existsSync(dbPath)) {
    try {
      sqliteDb = new Database(dbPath);
      console.log('Existing SQLite database found and opened for potential migration.');
    } catch (error) {
      console.warn('Could not open existing SQLite database for migration:', error);
    }
  }
} else {
  try {
    sqliteDb = new Database(dbPath);
    console.log('SQLite database initialized for local development.');
  } catch (error: any) {
    console.error('Failed to initialize SQLite:', error);
  }
}

export const db: DbInterface = {
  isPostgres: !!pgPool,
  query: async (text: string, params: any[] = []) => {
    if (pgPool) {
      let pgText = text;
      params.forEach((_, i) => {
        pgText = pgText.replace(/\?/, `$${i + 1}`);
      });
      return await pgPool.query(pgText, params);
    } else {
      return sqliteDb!.prepare(text).run(...params);
    }
  },
  get: async (text: string, params: any[] = []) => {
    if (pgPool) {
      let pgText = text;
      params.forEach((_, i) => {
        pgText = pgText.replace(/\?/, `$${i + 1}`);
      });
      const res = await pgPool.query(pgText, params);
      return res.rows[0];
    } else {
      return sqliteDb!.prepare(text).get(...params);
    }
  },
  all: async (text: string, params: any[] = []) => {
    if (pgPool) {
      let pgText = text;
      params.forEach((_, i) => {
        pgText = pgText.replace(/\?/, `$${i + 1}`);
      });
      const res = await pgPool.query(pgText, params);
      return res.rows;
    } else {
      return sqliteDb!.prepare(text).all(...params);
    }
  },
  run: async (text: string, params: any[] = []) => {
    if (pgPool) {
      let pgText = text;
      if (text.trim().toUpperCase().startsWith('INSERT')) {
        pgText += ' RETURNING id';
      }
      params.forEach((_, i) => {
        pgText = pgText.replace(/\?/, `$${i + 1}`);
      });
      const res = await pgPool.query(pgText, params);
      return { 
        lastInsertRowid: res.rows[0]?.id || 0, 
        changes: res.rowCount || 0 
      };
    } else {
      const info = sqliteDb!.prepare(text).run(...params);
      return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
    }
  }
};

/**
 * Створення таблиць, якщо вони не існують.
 * Використовує IF NOT EXISTS для безпечного запуску.
 */
async function ensureTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS site_content (
      id SERIAL PRIMARY KEY,
      section_key TEXT UNIQUE NOT NULL,
      content_json TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS cases (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS pricing_plans (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      label TEXT NOT NULL,
      featured INTEGER DEFAULT 0,
      features_json TEXT NOT NULL,
      result_text TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS process_steps (
      id SERIAL PRIMARY KEY,
      step_number TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS problem_cards (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS benefit_cards (
      id SERIAL PRIMARY KEY,
      icon_name TEXT NOT NULL,
      title TEXT NOT NULL,
      result TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS faq (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      message TEXT,
      plan TEXT,
      source TEXT,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      category TEXT,
      is_published INTEGER DEFAULT 0,
      published_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    let finalSql = sql;
    if (db.isPostgres) {
      finalSql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
                    .replace(/DATETIME/g, 'TIMESTAMP');
      await pgPool!.query(finalSql);
    } else {
      finalSql = sql.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
                    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
                    .replace(/TIMESTAMP/g, 'DATETIME');
      sqliteDb!.prepare(finalSql).run();
    }
  }
}

/**
 * Безпечне заповнення бази даних початковими даними.
 * Дані додаються ТІЛЬКИ якщо таблиця порожня або запис не існує.
 * Жодних DELETE FROM або примусових UPDATE.
 */
async function seedIfEmpty() {
  const isTableEmpty = async (table: string) => {
    try {
      const res = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
      return !res || parseInt(res.count) === 0;
    } catch (error) {
      console.error(`Error checking if table ${table} is empty:`, error);
      return true; // Assume empty on error to allow seeding/migration
    }
  };

  // 1. Site Content (idempotent check per section_key)
  const sections = [
    { key: 'hero', content: { title: 'Будую автономні системи , які перетворюють трафік у гроші', subtitle: 'Ви вже платите за рекламу. Ви вже отримуєте переходи на сайт. Але питання не в трафіку. Питання в тому, що відбувається після кліку.\n\nУ більшості випадків сайт:\n— не пояснює цінність\n— не веде до дії\n— не обробляє заявку\n— і просто “зливає” потенційного клієнта\n\nЯ створюю системи, які працюють інакше.\n\nЦе не просто сайт. Це повноцінна система, яка:\n— приймає заявки\n— одразу надсилає їх у Telegram\n— зберігає всі контакти в базі\n— нагадує вам про клієнта, якщо ви не відповіли\n— і допомагає довести його до продажу\n\nПлюс: ви отримуєте окрему адмін-панель, де можете самостійно змінювати тексти, фото, відео і блоки без участі розробника.', primaryButtonText: 'Обговорити проект', secondaryButtonText: 'Отримати відео-розбір', badge1: '✔ Відповідаю протягом 15 хвилин', badge2: '✔ Безкоштовний розбір перед стартом', flowLead: 'Заявка', flowLabel1: 'Крок 01', flowTelegram: 'Telegram', flowLabel2: 'Крок 02', flowCRM: 'CRM', flowLabel3: 'Крок 03', flowReminder: 'Нагадування', flowLabel4: 'Крок 04', moreButtonText: 'Докладніше про систему', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', readMoreLabel: 'докладніше', collapseLabel: 'згорнути' } },
    { key: 'about', content: { title: 'Я створюю системи, а не просто сайти', paragraphs: ['Мене звати Роман. Я займаюсь не дизайном заради дизайну, а створенням інструментів, які реально впливають на прибуток бізнесу.', 'Мій підхід базується на трьох речах: маркетинг, логіка поведінки клієнта, автоматизація. Кожен сайт, який я роблю, має одну задачу — перетворювати відвідувачів у клієнтів.'], image: '/roman-photo.jpg', experienceValue: '5+', experienceLabel: 'РОКІВ ДОСВІДУ', skills: ['React', 'TypeScript', 'Node.js', 'Framer Motion', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS', 'Webflow', 'Автоматизація', 'UX/UI Дизайн', 'CRM Integration', 'Telegram Bots'] } },
    { key: 'cta', content: { title: 'Отримайте безкоштовний відео-аудит вашого сайту', subtitle: 'Я подивлюсь вашу сторінку і покажу: де ви втрачаєте клієнтів, що саме не працює, як це виправити. Це не загальні поради — це конкретні кроки під ваш бізнес.\n\n*Консультація безкоштовна. Це вас ні до чого не зобов\'язує.', buttonText: 'Отримати розбір', additionalText: '' } },
    { key: 'contacts', content: { title: 'Готові почати заробляти більше?', subtitle: 'Напишіть мені — і ми розберемо ваш проект вже сьогодні. Ви отримаєте цінні знання, незалежно від того, чи будемо ми працювати разом надалі', email: 'kizub888@gmail.com', telegram: '@Kizub_BRB', formNameLabel: 'ІМ’Я', formContactLabel: 'ТЕЛЕФОН / EMAIL', formMessageLabel: 'ПОВІДОМЛЕННЯ', formButtonText: 'Надіслати запит' } },
    { key: 'footer', content: { copyright: '© 2026 Roman Dev. Всі права захищені.', telegramLink: 'https://t.me/Kizub_BRB' } },
    { key: 'seo', content: { title: 'Roman Dev | Автономні системи залучення клієнтів', description: 'Будую автономні системи залучення клієнтів, які перетворюють трафік у стабільний потік заявок і продажів.', ogTitle: 'Roman Dev - Системи залучення клієнтів', ogDescription: 'Перетворюйте трафік у стабільний потік заявок.', ogImage: '', favicon: '' } },
    { key: 'problems_header', content: { title: 'Проблеми, які ми вирішуємо', subtitle: 'Якщо ваш сайт просто “висить” в інтернеті — він не працює. Ось що ми виправляємо.' } },
    { key: 'benefits_header', content: { title: 'Чому це працює краще за звичайний сайт', subtitle: 'Ми не просто малюємо картинки. Ми будуємо логіку, яка веде клієнта до покупки.' } },
    { key: 'speed_roi', content: { title: 'ШВИДКІСТЬ = ГРОШІ', subtitle: 'Швидкість відповіді безпосередньо впливає на прибуток. Є проста закономірність: чим швидше ви відповідаєте — тим більша ймовірність продажу.', description: 'Розрахуйте потенційний прибуток, який ви недоотримуєте через низьку конверсію.', features: [{ title: 'Автоматизація', desc: 'заявка приходить одразу / Telegram сповіщення / авто-відповідь / нагадування' }, { title: 'Переваги', desc: 'не втрачаєте клієнтів / швидше за конкурентів / ріст конверсії' }, { title: 'Результат', desc: 'Стабільний потік заявок без зливу бюджету' }], statPrefix: 'до', statValue: '+400%', statLabel: 'Ріст конверсії в продаж', statDesc: 'при відповіді клієнту в перші 5 хвилин', labelTraffic: 'ТРАФІК (ВІДВІДУВАЧІВ / МІС.)', labelConversion: 'КОНВЕРСІЯ (%)', labelCheck: 'СЕРЕДНІЙ ЧЕК (ГРН)', labelCurrentRevenue: 'Поточний дохід:', labelPotentialRevenue: 'Потенціал (при 5% конверсії):', labelLostProfit: 'ВАША НЕДООТРИМАНА ВИГОДА:' } },
    { key: 'cases_header', content: { title: 'Результати, які можна виміряти в грошах', subtitle: 'Кейси, де ми впровадили систему і вивели бізнес на новий рівень.' } },
    { key: 'process_header', content: { title: 'Як ми будуємо вашу систему', subtitle: 'Від першого дзвінка до стабільного потоку заявок — всього 6 кроків.' } },
    { key: 'pricing_header', content: { title: 'Оберіть свій рівень масштабування', subtitle: 'Ми підберемо рішення під ваші задачі: від швидкого старту до повного захоплення ринку.', resultLabel: 'Результат:', selectPlanLabel: 'Обрати цей формат' } },
    { key: 'faq_header', content: { title: 'Часті запитання', subtitle: 'Відповіді на те, що зазвичай цікавить моїх клієнтів.' } }
  ];

  for (const section of sections) {
    const exists = await db.get('SELECT id FROM site_content WHERE section_key = ?', [section.key]);
    if (!exists) {
      // Вставляємо тільки якщо запису немає. Жодного UPDATE існуючих даних.
      await db.run('INSERT INTO site_content (section_key, content_json) VALUES (?, ?)', [section.key, JSON.stringify(section.content)]);
    }
  }

  // 2. Process Steps
  if (await isTableEmpty('process_steps')) {
    const steps = [
      { num: '01', title: 'Аналіз', desc: 'Ми детально розбираємо: ваш продукт, конкурентів, як зараз приходять клієнти, де ви втрачаєте гроші.' },
      { num: '02', title: 'Стратегія і структура', desc: 'Будуємо логіку сайту: що бачить клієнт, як він рухається, де приймає рішення.' },
      { num: '03', title: 'Копірайтинг і прототип', desc: 'Пишемо тексти, які продають, і створюємо чорновий варіант системи.' },
      { num: '04', title: 'Дизайн і розробка', desc: 'Створюємо візуальну частину, яка підкреслює вашу експертність, та програмуємо систему.' },
      { num: '05', title: 'Автоматизація', desc: 'Підключаємо Telegram, CRM, налаштовуємо сповіщення та нагадування.' },
      { num: '06', title: 'Запуск і підтримка', desc: 'Запускаємо систему, тестуємо і супроводжуємо перший місяць.' }
    ];
    for (const s of steps) {
      await db.run('INSERT INTO process_steps (step_number, title, description) VALUES (?, ?, ?)', [s.num, s.title, s.desc]);
    }
  }

  // 3. Problem Cards
  if (await isTableEmpty('problem_cards')) {
    const problems = [
      { title: 'Люди заходять на сайт і йдуть', desc: 'Користувач відкриває сторінку і за 3–5 секунд вирішує — залишатися чи ні. Якщо він не розуміє цінність — він просто закриває вкладку. І кожен такий перехід — це ваші гроші.' },
      { title: 'Ви втрачаєте заявки після їх отримання', desc: 'Якщо ви відповідаєте через 30–60 хв або заявка \'загубилась\' — клієнт уже пішов до конкурента. Навіть гарячий лід остигає миттєво.' },
      { title: 'Сайт не виконує функцію продажу', desc: 'Більшість сайтів — це просто \'вітрина\'. Вони виглядають нормально, але не ведуть до дії і не працюють як система. У результаті — немає стабільних заявок.' }
    ];
    for (const p of problems) {
      await db.run('INSERT INTO problem_cards (title, description) VALUES (?, ?)', [p.title, p.desc]);
    }
  }

  // 4. Benefit Cards
  if (await isTableEmpty('benefit_cards')) {
    const benefits = [
      { icon: 'Layout', title: 'Продумана структура', res: 'Ми будуємо логіку: що бачить людина, що вона думає і чому вона залишає заявку.' },
      { icon: 'Zap', title: 'Швидкість і простота', res: 'Сайт завантажується миттєво і не перевантажує користувача. Все максимально зрозуміло.' },
      { icon: 'MessageSquare', title: 'Повна обробка заявок', res: 'Заявка в Telegram, збереження в системі та автоматичні нагадування.' }
    ];
    for (const b of benefits) {
      await db.run('INSERT INTO benefit_cards (icon_name, title, result) VALUES (?, ?, ?)', [b.icon, b.title, b.res]);
    }
  }

  // 5. FAQ
  if (await isTableEmpty('faq')) {
    const faqs = [
      { q: 'Скільки часу займає розробка?', a: 'В середньому від 7 до 14 днів, залежно від складності системи та обсягу контенту.' },
      { q: 'Чи потрібна мені CRM?', a: 'Якщо ви отримуєте більше 5 заявок на день — так. Це допоможе не втрачати клієнтів і бачити всю історію спілкування.' },
      { q: 'Чи можна редагувати сайт самостійно?', a: 'Так, ви отримуєте зручну адмін-панель, де можна редагувати майже все без програміста.' },
      { q: 'Що відбувається після заявки?', a: 'Заявка миттєво падає в Telegram, дублюється в базу даних, а клієнт отримує автоматичне підтвердження.' },
      { q: 'Чи допомагаєте з рекламою?', a: 'Так, я можу налаштувати базову рекламу в Google або Facebook, щоб ви отримали перші результати одразу.' },
      { q: 'Чи буде сайт показуватись у Google?', a: 'Так, я роблю базову SEO-оптимізацію, щоб пошукові системи правильно індексували ваш сайт.' },
      { q: 'Чи є гарантія результату?', a: 'Я гарантую технічну якість та відповідність стратегії. Результат у грошах залежить також від вашого продукту та відділу продажу.' }
    ];
    for (const f of faqs) {
      await db.run('INSERT INTO faq (question, answer) VALUES (?, ?)', [f.q, f.a]);
    }
  }

  // 6. Cases
  if (await isTableEmpty('cases')) {
    const cases = [
      { niche: 'АДВОКАТСЬКЕ БЮРО', title: 'Система для адвокатського бюро', image: 'https://picsum.photos/seed/law/800/600', problem: 'багато переходів, але мало заявок', detailed_problem: 'Сайт мав багато відвідувачів з реклами, але конверсія в заявку була критично низькою. Бюджет витрачався, але клієнти не залишали контакти.', solution: 'змінили структуру сайту — переписали тексти — додали логіку дій — підключили обробку заявок', detailed_solution: 'Ми повністю переробили шлях клієнта. Замість загальних послуг виділили конкретні болі аудиторії. Впровадили систему миттєвих сповіщень у Telegram для юристів.', result: '— збільшення кількості заявок — стабільний потік клієнтів — без збільшення бюджету', link: 'https://example.com' }
    ];
    for (const c of cases) {
      await db.run(`INSERT INTO cases (niche, title, image, problem, detailed_problem, solution, detailed_solution, result, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [c.niche, c.title, c.image, c.problem, c.detailed_problem, c.solution, c.detailed_solution, c.result, c.link]);
    }
  }

  // 7. Pricing Plans
  if (await isTableEmpty('pricing_plans')) {
    const plans = [
      { name: 'Старт', price: 'від 400$', label: 'ДЛЯ ШВИДКОГО СТАРТУ', featured: 0, features: ['Лендінг', 'Аналіз конкурентів', 'Дизайн + Копірайтинг', 'Telegram сповіщення', 'Адаптив під мобільні'], result_text: 'Швидкий запуск для перевірки ніші та отримання лідів' },
      { name: 'Бізнес', price: 'від 650$', label: 'ГЕНЕРАЦІЯ ТА ОБРОБКА', featured: 1, features: ['Все з Тарифу Старт', 'Глибока стратегія', 'Складна автоматизація', 'Інтеграція з CRM', 'A/B тестування'], result_text: 'Повноцінна система генерації та обробки лідів' },
      { name: 'Про', price: 'від 1000$', label: 'БІЗНЕС-СИСТЕМА', featured: 0, features: ['Все з Тарифу Бізнес', 'Повна воронка продажів', 'UX-оптимізація', 'Супровід 1 місяць', 'Пріоритетна підтримка'], result_text: 'Масштабована бізнес-система під ключ' }
    ];
    for (const p of plans) {
      await db.run(`INSERT INTO pricing_plans (name, price, label, featured, features_json, result_text) VALUES (?, ?, ?, ?, ?, ?)`, [p.name, p.price, p.label, p.featured, JSON.stringify(p.features), p.result_text]);
    }
  }
}

/**
 * Головна функція ініціалізації бази даних.
 */
export async function initDb() {
  try {
    console.log(`Initializing ${db.isPostgres ? 'PostgreSQL' : 'SQLite'} database...`);
    
    // 1. Створення таблиць (безпечно)
    await ensureTables();

    // 2. Міграція даних (Тимчасово вимкнено за запитом користувача)
    /*
    if (db.isPostgres && sqliteDb && IS_PROD) {
      await migrateData();
    }
    */

    // 3. Створення адміна (якщо немає)
    const envUsername = (process.env.ADMIN_USERNAME || 'Kizub').trim();
    const envPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();
    const hashedPassword = bcrypt.hashSync(envPassword, 10);

    const admin = await db.get('SELECT * FROM users WHERE username = ?', [envUsername]);
    if (!admin) {
      await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [envUsername, hashedPassword]);
      console.log(`Admin user '${envUsername}' created.`);
    }

    // 4. БЕЗПЕЧНИЙ SEED: Тільки якщо база порожня
    await seedIfEmpty();
    
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('!!! CRITICAL ERROR during database initialization:', error);
    throw error; // Прокидаємо помилку далі, щоб сервер не стартував у битому стані
  }
}

/**
 * Міграція даних з SQLite до PostgreSQL.
 * Використовується при першому переході на PostgreSQL у production.
 */
async function migrateData() {
  console.log('Checking for data migration from SQLite to PostgreSQL...');
  try {
    const isTableEmpty = async (table: string) => {
      try {
        const res = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
        return !res || parseInt(res.count) === 0;
      } catch (error) {
        return true;
      }
    };

    // Міграція Site Content
    if (await isTableEmpty('site_content')) {
      const sqliteContent = sqliteDb!.prepare('SELECT * FROM site_content').all() as any[];
      for (const item of sqliteContent) {
        await db.run('INSERT INTO site_content (section_key, content_json) VALUES (?, ?)', [item.section_key, item.content_json]);
      }
    }

    // Міграція Статей
    const sqliteArticles = sqliteDb!.prepare('SELECT * FROM articles').all() as any[];
    for (const art of sqliteArticles) {
      const exists = await db.get('SELECT id FROM articles WHERE slug = ?', [art.slug]);
      if (!exists) {
        await db.run(`
          INSERT INTO articles (slug, title, excerpt, content, image, category, is_published, published_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [art.slug, art.title, art.excerpt, art.content, art.image, art.category, art.is_published, art.published_at, art.created_at]);
      }
    }
    
    // Міграція Лідів
    const sqliteLeads = sqliteDb!.prepare('SELECT * FROM leads').all() as any[];
    for (const lead of sqliteLeads) {
      const exists = await db.get('SELECT id FROM leads WHERE contact = ? AND created_at = ?', [lead.contact, lead.created_at]);
      if (!exists) {
        await db.run(`
          INSERT INTO leads (name, contact, message, plan, source, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [lead.name, lead.contact, lead.message, lead.plan, lead.source, lead.status, lead.created_at]);
      }
    }

    // Міграція інших таблиць (тільки якщо вони порожні в PostgreSQL)
    const tablesToMigrate = ['cases', 'pricing_plans', 'process_steps', 'problem_cards', 'benefit_cards', 'faq'];
    for (const table of tablesToMigrate) {
      if (await isTableEmpty(table)) {
        const rows = sqliteDb!.prepare(`SELECT * FROM ${table}`).all() as any[];
        if (rows.length > 0) {
          for (const row of rows) {
            const { id, created_at, updated_at, ...data } = row;
            const keys = Object.keys(data);
            const placeholders = keys.map(() => '?').join(', ');
            const columns = keys.join(', ');
            const values = keys.map(k => data[k]);
            await db.run(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values);
          }
        }
      }
    }
    console.log('Migration check finished.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

export default db;
