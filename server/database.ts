import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.sqlite');
const DATABASE_URL = process.env.DATABASE_URL;

// Types for our unified DB interface
export interface DbInterface {
  query: (text: string, params?: any[]) => Promise<any>;
  get: (text: string, params?: any[]) => Promise<any>;
  all: (text: string, params?: any[]) => Promise<any[]>;
  run: (text: string, params?: any[]) => Promise<{ lastInsertRowid: number | string; changes: number }>;
  isPostgres: boolean;
}

let sqliteDb: Database.Database | null = null;
let pgPool: pkg.Pool | null = null;

// Initialize SQLite anyway as a backup or source for migration
try {
  sqliteDb = new Database(dbPath);
} catch (error: any) {
  if (error.code === 'SQLITE_CORRUPT') {
    console.error('Database file is malformed. Deleting and recreating...');
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    sqliteDb = new Database(dbPath);
  } else {
    console.error('Failed to initialize SQLite:', error);
  }
}

if (DATABASE_URL) {
  console.log('PostgreSQL URL detected. Initializing connection pool...');
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Unified DB object
export const db: DbInterface = {
  isPostgres: !!pgPool,
  query: async (text: string, params: any[] = []) => {
    if (pgPool) {
      // Convert SQL syntax from SQLite (?) to Postgres ($1, $2...)
      let pgText = text;
      params.forEach((_, i) => {
        pgText = pgText.replace('?', `$${i + 1}`);
      });
      const res = await pgPool.query(pgText, params);
      return res;
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
      // Handle INSERT ... RETURNING for Postgres to get ID
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

export async function initDb() {
  try {
    console.log(`Initializing ${db.isPostgres ? 'PostgreSQL' : 'SQLite'} database...`);
    
    const tables = [
      // Users
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      // Site Content
      `CREATE TABLE IF NOT EXISTS site_content (
        id SERIAL PRIMARY KEY,
        section_key TEXT UNIQUE NOT NULL,
        content_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      // Cases
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
      // Pricing
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
      // Process
      `CREATE TABLE IF NOT EXISTS process_steps (
        id SERIAL PRIMARY KEY,
        step_number TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
      )`,
      // Problems
      `CREATE TABLE IF NOT EXISTS problem_cards (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
      )`,
      // Benefits
      `CREATE TABLE IF NOT EXISTS benefit_cards (
        id SERIAL PRIMARY KEY,
        icon_name TEXT NOT NULL,
        title TEXT NOT NULL,
        result TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
      )`,
      // FAQ
      `CREATE TABLE IF NOT EXISTS faq (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      // Leads
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
      // Articles
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
      if (db.isPostgres) {
        // Adjust syntax for Postgres
        const pgSql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
                         .replace(/DATETIME/g, 'TIMESTAMP');
        await pgPool!.query(pgSql);
      } else {
        sqliteDb!.prepare(sql).run();
      }
    }

    // Migration logic: If Postgres is active, check if we need to migrate from SQLite
    if (db.isPostgres && sqliteDb) {
      await migrateData();
    }

    // Ensure Admin
    const envUsername = (process.env.ADMIN_USERNAME || 'Kizub').trim();
    const envPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();
    const hashedPassword = bcrypt.hashSync(envPassword, 10);

    const admin = await db.get('SELECT * FROM users WHERE username = ?', [envUsername]);
    if (!admin) {
      await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [envUsername, hashedPassword]);
      console.log(`Admin user '${envUsername}' created.`);
    }

    await seedInitialContent();
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

async function migrateData() {
  console.log('Checking for data migration from SQLite to PostgreSQL...');
  try {
    // Migrate Articles as priority
    const sqliteArticles = sqliteDb!.prepare('SELECT * FROM articles').all() as any[];
    for (const art of sqliteArticles) {
      const exists = await db.get('SELECT id FROM articles WHERE slug = ?', [art.slug]);
      if (!exists) {
        console.log(`Migrating article: ${art.title}`);
        await db.run(`
          INSERT INTO articles (slug, title, excerpt, content, image, category, is_published, published_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [art.slug, art.title, art.excerpt, art.content, art.image, art.category, art.is_published, art.published_at, art.created_at]);
      }
    }
    
    // Migrate Leads
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
    console.log('Migration check finished.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

async function seedInitialContent() {
  const count = await db.get('SELECT COUNT(*) as count FROM site_content');
  if (count.count > 0) return;

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
    }
  ];

  for (const section of sections) {
    await db.run('INSERT INTO site_content (section_key, content_json) VALUES (?, ?)', [section.key, JSON.stringify(section.content)]);
  }
}

export default db;
