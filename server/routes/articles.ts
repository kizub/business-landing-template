import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all published articles
router.get('/', async (req, res) => {
  try {
    const articles = await db.all(`
      SELECT id, slug, title, excerpt, image, category, published_at 
      FROM articles 
      WHERE is_published = 1 
      ORDER BY published_at DESC
    `);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

// Public: Get single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await db.get('SELECT * FROM articles WHERE slug = ? AND is_published = 1', [req.params.slug]) as any;
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    // Parse JSON fields if they are strings (SQLite)
    if (typeof article.system_includes === 'string') article.system_includes = JSON.parse(article.system_includes || '[]');
    if (typeof article.target_audience === 'string') article.target_audience = JSON.parse(article.target_audience || '[]');
    if (typeof article.faq === 'string') article.faq = JSON.parse(article.faq || '[]');
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching article' });
  }
});

// Admin: Get all articles (including drafts)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const articles = await db.all('SELECT * FROM articles ORDER BY created_at DESC');
    const parsedArticles = articles.map((article: any) => {
      if (typeof article.system_includes === 'string') article.system_includes = JSON.parse(article.system_includes || '[]');
      if (typeof article.target_audience === 'string') article.target_audience = JSON.parse(article.target_audience || '[]');
      if (typeof article.faq === 'string') article.faq = JSON.parse(article.faq || '[]');
      return article;
    });
    res.json(parsedArticles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

// Admin: Create article
router.post('/', authenticateToken, async (req, res) => {
  const { title, slug, excerpt, content, image, category, is_published, system_includes, target_audience, faq, seo_title, seo_description } = req.body;
  try {
    const published_at = is_published ? new Date().toISOString() : null;
    const result = await db.run(`
      INSERT INTO articles (title, slug, excerpt, content, image, category, is_published, published_at, system_includes, target_audience, faq, seo_title, seo_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, 
      slug, 
      excerpt, 
      content, 
      image, 
      category, 
      is_published ? 1 : 0, 
      published_at,
      JSON.stringify(system_includes || []),
      JSON.stringify(target_audience || []),
      JSON.stringify(faq || []),
      seo_title,
      seo_description
    ]);
    
    res.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    // SQLite: SQLITE_CONSTRAINT_UNIQUE, Postgres: 23505
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    res.status(500).json({ message: 'Error creating article' });
  }
});

// Admin: Update article
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, slug, excerpt, content, image, category, is_published, system_includes, target_audience, faq, seo_title, seo_description } = req.body;
  try {
    const current = await db.get('SELECT is_published, published_at FROM articles WHERE id = ?', [req.params.id]) as any;
    if (!current) return res.status(404).json({ message: 'Article not found' });
    
    let published_at = current.published_at;
    
    if (is_published && !current.is_published) {
      published_at = new Date().toISOString();
    } else if (!is_published) {
      published_at = null;
    }

    await db.run(`
      UPDATE articles 
      SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, category = ?, is_published = ?, published_at = ?, 
          system_includes = ?, target_audience = ?, faq = ?, seo_title = ?, seo_description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, 
      slug, 
      excerpt, 
      content, 
      image, 
      category, 
      is_published ? 1 : 0, 
      published_at, 
      JSON.stringify(system_includes || []),
      JSON.stringify(target_audience || []),
      JSON.stringify(faq || []),
      seo_title,
      seo_description,
      req.params.id
    ]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating article' });
  }
});

// Admin: Delete article
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.run('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting article' });
  }
});

export default router;
