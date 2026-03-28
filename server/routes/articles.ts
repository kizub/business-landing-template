import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all published articles
router.get('/', (req, res) => {
  try {
    const articles = db.prepare(`
      SELECT id, slug, title, excerpt, image, category, published_at 
      FROM articles 
      WHERE is_published = 1 
      ORDER BY published_at DESC
    `).all();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

// Public: Get single article by slug
router.get('/:slug', (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM articles WHERE slug = ? AND is_published = 1').get(req.params.slug);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching article' });
  }
});

// Admin: Get all articles (including drafts)
router.get('/admin/all', authenticateToken, (req, res) => {
  try {
    const articles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

// Admin: Create article
router.post('/', authenticateToken, (req, res) => {
  const { title, slug, excerpt, content, image, category, is_published } = req.body;
  try {
    const published_at = is_published ? new Date().toISOString() : null;
    const result = db.prepare(`
      INSERT INTO articles (title, slug, excerpt, content, image, category, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, slug, excerpt, content, image, category, is_published ? 1 : 0, published_at);
    
    res.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    res.status(500).json({ message: 'Error creating article' });
  }
});

// Admin: Update article
router.put('/:id', authenticateToken, (req, res) => {
  const { title, slug, excerpt, content, image, category, is_published } = req.body;
  try {
    const current = db.prepare('SELECT is_published, published_at FROM articles WHERE id = ?').get(req.params.id) as any;
    let published_at = current.published_at;
    
    if (is_published && !current.is_published) {
      published_at = new Date().toISOString();
    } else if (!is_published) {
      published_at = null;
    }

    db.prepare(`
      UPDATE articles 
      SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, category = ?, is_published = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, slug, excerpt, content, image, category, is_published ? 1 : 0, published_at, req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating article' });
  }
});

// Admin: Delete article
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting article' });
  }
});

export default router;
