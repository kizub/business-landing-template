import express from "express";
import db from "../database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ПУБЛІЧНИЙ: Отримання всього контенту для сайту
router.get("/", (req, res) => {
  const siteContent = db.prepare("SELECT section_key, content_json FROM site_content").all() as any[];
  const cases = db.prepare("SELECT * FROM cases WHERE is_active = 1").all();
  const pricing = db.prepare("SELECT * FROM pricing_plans WHERE is_active = 1").all();
  const process = db.prepare("SELECT * FROM process_steps WHERE is_active = 1").all();
  const problems = db.prepare("SELECT * FROM problem_cards WHERE is_active = 1").all();
  const benefits = db.prepare("SELECT * FROM benefit_cards WHERE is_active = 1").all();
  const faq = db.prepare("SELECT * FROM faq WHERE is_active = 1").all();

  const content: any = {};
  siteContent.forEach(item => {
    content[item.section_key] = JSON.parse(item.content_json);
  });

  res.json({
    content,
    cases,
    pricing: pricing.map((p: any) => ({ ...p, features: JSON.parse(p.features_json) })),
    process,
    problems,
    benefits,
    faq
  });
});

// ПУБЛІЧНИЙ: Отримання конкретної секції
router.get("/:section", (req, res) => {
  const { section } = req.params;
  const item = db.prepare("SELECT content_json FROM site_content WHERE section_key = ?").get(section) as any;

  if (!item) {
    return res.status(404).json({ message: "Section not found" });
  }

  res.json(JSON.parse(item.content_json));
});

// ЗАХИЩЕНИЙ: Оновлення секції контенту
router.put("/:section", authenticateToken, (req, res) => {
  const { section } = req.params;
  const content = req.body;

  const result = db.prepare("UPDATE site_content SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE section_key = ?")
    .run(JSON.stringify(content), section);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Section not found" });
  }

  res.json({ message: "Section updated successfully" });
});

// ЗАХИЩЕНИЙ: Оновлення кейсу
router.put("/cases/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { niche, title, image, problem, detailed_problem, detailed_solution, solution, result, link } = req.body;

  db.prepare(`
    UPDATE cases 
    SET niche = ?, title = ?, image = ?, problem = ?, detailed_problem = ?, detailed_solution = ?, solution = ?, result = ?, link = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(niche, title, image, problem, detailed_problem, detailed_solution, solution, result, link, id);

  res.json({ message: "Case updated successfully" });
});

// ЗАХИЩЕНИЙ: Оновлення тарифу
router.put("/pricing/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, price, label, featured, features, result_text } = req.body;

  db.prepare(`
    UPDATE pricing_plans 
    SET name = ?, price = ?, label = ?, featured = ?, features_json = ?, result_text = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, price, label, featured ? 1 : 0, JSON.stringify(features), result_text, id);

  res.json({ message: "Pricing plan updated successfully" });
});

// ЗАХИЩЕНИЙ: Оновлення кроку процесу
router.put("/process/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { step_number, title, description } = req.body;

  db.prepare(`
    UPDATE process_steps 
    SET step_number = ?, title = ?, description = ?
    WHERE id = ?
  `).run(step_number, title, description, id);

  res.json({ message: "Process step updated successfully" });
});

// ЗАХИЩЕНИЙ: Оновлення картки проблеми
router.put("/problem-cards/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  db.prepare(`
    UPDATE problem_cards 
    SET title = ?, description = ?
    WHERE id = ?
  `).run(title, description, id);

  res.json({ message: "Problem card updated successfully" });
});

// ЗАХИЩЕНИЙ: Оновлення картки переваги
router.put("/benefit-cards/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { icon_name, title, result } = req.body;

  db.prepare(`
    UPDATE benefit_cards 
    SET icon_name = ?, title = ?, result = ?
    WHERE id = ?
  `).run(icon_name, title, result, id);

  res.json({ message: "Benefit card updated successfully" });
});

// ЗАХИЩЕНИЙ: Оновлення FAQ
router.put("/faq/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  db.prepare(`
    UPDATE faq 
    SET question = ?, answer = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(question, answer, id);

  res.json({ message: "FAQ updated successfully" });
});

// Додати новий FAQ
router.post("/faq", authenticateToken, (req, res) => {
  const { question, answer } = req.body;

  const stmt = db.prepare(`
    INSERT INTO faq (question, answer)
    VALUES (?, ?)
  `);

  const result = stmt.run(question, answer);
  res.json({ id: result.lastInsertRowid, message: "FAQ created successfully" });
});

// Видалити FAQ
router.delete("/faq/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM faq WHERE id = ?").run(id);
  res.json({ message: "FAQ deleted successfully" });
});

// --- КЕЙСИ (Спеціальні маршрути для додавання/видалення) ---

// Додати новий кейс
router.post("/cases", authenticateToken, (req, res) => {
  const { title, niche, image, problem, detailed_problem, solution, detailed_solution, result, link } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO cases (title, niche, image, problem, detailed_problem, solution, detailed_solution, result, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const info = stmt.run(title, niche, image, problem, detailed_problem, solution, detailed_solution, result, link);
    res.status(201).json({ id: info.lastInsertRowid, message: "Кейс створено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при створенні кейсу" });
  }
});

// Видалити кейс
router.delete("/cases/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("DELETE FROM cases WHERE id = ?");
  
  try {
    stmt.run(id);
    res.json({ message: "Кейс видалено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при видаленні кейсу" });
  }
});

// --- ЛІДИ (Заявки) ---

// Отримати всі ліди
router.get("/leads/all", authenticateToken, (req, res) => {
  try {
    const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Помилка при отриманні лідів" });
  }
});

// Оновити статус ліда
router.put("/leads/:id/status", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
    res.json({ message: "Статус ліда оновлено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при оновленні статусу" });
  }
});

// Видалити лід
router.delete("/leads/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("DELETE FROM leads WHERE id = ?").run(id);
    res.json({ message: "Лід видалено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при видаленні ліда" });
  }
});

export default router;
