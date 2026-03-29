import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import Database from 'better-sqlite3';
import pkg from 'pg';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const prerender = require('vite-plugin-prerender');
const JSDOMRenderer = require('@prerenderer/renderer-jsdom');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pkg;

async function getArticleRoutes(env: Record<string, string>) {
  const routes = ['/', '/blog'];
  try {
    const DATABASE_URL = env.DATABASE_URL;
    const dbPath = env.DATABASE_PATH || path.join(process.cwd(), 'database.sqlite');
    
    let articles: any[] = [];
    
    if (DATABASE_URL) {
      const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      const res = await pool.query('SELECT slug FROM articles WHERE is_published = 1');
      articles = res.rows;
      await pool.end();
    } else {
      const db = new Database(dbPath);
      articles = db.prepare('SELECT slug FROM articles WHERE is_published = 1').all();
      db.close();
    }
    
    articles.forEach(article => {
      routes.push(`/blog/${article.slug}`);
    });
  } catch (error) {
    console.error('Error fetching routes for prerender:', error);
  }
  return routes;
}

export default defineConfig(async ({mode}) => {
  const env = loadEnv(mode, '.', '');
  const routes = await getArticleRoutes(env);
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      prerender({
        staticDir: path.join(__dirname, 'dist'),
        routes: routes,
        renderer: new JSDOMRenderer({
          renderAfterDocumentEvent: 'render-event',
          renderAfterTime: 5000
        }),
        postProcess(renderedRoute) {
          // Clean up scripts if needed, but usually not necessary for SEO
          return renderedRoute;
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
