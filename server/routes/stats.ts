import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get lead stats for charts
router.get('/leads', authenticateToken, async (req, res) => {
  try {
    let stats;
    if (db.isPostgres) {
      stats = await db.all(`
        SELECT 
          d.date::text,
          COUNT(l.id) as count
        FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') AS d(date)
        LEFT JOIN leads l ON l.created_at::date = d.date
        GROUP BY d.date
        ORDER BY d.date ASC
      `);
    } else {
      stats = await db.all(`
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
      `);
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Get lead status distribution
router.get('/status-distribution', authenticateToken, async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT status, COUNT(*) as count 
      FROM leads 
      GROUP BY status
    `);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching status distribution' });
  }
});

export default router;
