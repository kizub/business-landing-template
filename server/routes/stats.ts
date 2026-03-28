import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get lead stats for charts
router.get('/leads', authenticateToken, (req, res) => {
  try {
    const days = 30;
    const stats = db.prepare(`
      WITH RECURSIVE dates(date) AS (
        SELECT date('now', '-29 days')
        UNION ALL
        SELECT date(date, '+1 day') FROM dates WHERE date < date('now')
      )
      SELECT 
        d.date,
        COUNT(l.id) as count
      FROM dates d
      LEFT JOIN leads l ON date(l.created_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `).all();

    res.json(stats);
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Get lead status distribution
router.get('/status-distribution', authenticateToken, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM leads 
      GROUP BY status
    `).all();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching status distribution' });
  }
});

export default router;
