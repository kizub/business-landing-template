import express from "express";
import db from "../database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const safeParse = (json: string, fallback: any = {}) => {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch (e) {
    console.error("JSON parse error:", e, "for JSON:", json);
    return fallback;
  }
};

// ПУБЛІЧНИЙ: Отримання всього контенту для сайту
router.get("/", async (req, res) => {
  try {
    const siteContent = await db.all("SELECT section_key, content_json FROM site_content") as any[];
    const cases = await db.all("SELECT * FROM cases WHERE is_active = 1");
    const pricing = await db.all("SELECT * FROM pricing_plans WHERE is_active = 1");
    const process = await db.all("SELECT * FROM process_steps WHERE is_active = 1");
    const problems = await db.all("SELECT * FROM problem_cards WHERE is_active = 1");
    const benefits = await db.all("SELECT * FROM benefit_cards WHERE is_active = 1");
    const faq = await db.all("SELECT * FROM faq WHERE is_active = 1");

    const content: any = {};
    siteContent.forEach(item => {
      content[item.section_key] = safeParse(item.content_json);
    });

    res.json({
      content,
      cases,
      pricing: pricing.map((p: any) => ({ 
        ...p, 
        features: safeParse(p.features_json, []),
        is_featured: !!p.featured 
      })),
      process,
      problems,
      benefits,
      faq
    });
  } catch (error) {
    console.error("Error in GET /api/content:", error);
    res.status(500).json({ message: "Error fetching content", details: error instanceof Error ? error.message : String(error) });
  }
});

// ПУБЛІЧНИЙ: Отримання конкретної секції
router.get("/:section", async (req, res) => {
  const { section } = req.params;
  try {
    const item = await db.get("SELECT content_json FROM site_content WHERE section_key = ?", [section]) as any;

    if (!item) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json(safeParse(item.content_json));
  } catch (error) {
    res.status(500).json({ message: "Error fetching section" });
  }
});

// ЗАХИЩЕНИЙ: Оновлення секції контенту
router.put("/:section", authenticateToken, async (req, res) => {
  const { section } = req.params;
  const content = req.body;

  try {
    const result = await db.run("UPDATE site_content SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE section_key = ?",
      [JSON.stringify(content), section]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({ message: "Section updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating section" });
  }
});

// ЗАХИЩЕНИЙ: Оновлення кейсу
router.put("/cases/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { niche, title, image, problem, detailed_problem, detailed_solution, solution, result, link } = req.body;

  try {
    await db.run(`
      UPDATE cases 
      SET niche = ?, title = ?, image = ?, problem = ?, detailed_problem = ?, detailed_solution = ?, solution = ?, result = ?, link = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [niche, title, image, problem, detailed_problem, detailed_solution, solution, result, link, id]);

    res.json({ message: "Case updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating case" });
  }
});

// ЗАХИЩЕНИЙ: Оновлення тарифу
router.put("/pricing/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, price, label, featured, features, result_text } = req.body;

  try {
    await db.run(`
      UPDATE pricing_plans 
      SET name = ?, price = ?, label = ?, featured = ?, features_json = ?, result_text = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, price, label, featured ? 1 : 0, JSON.stringify(features), result_text, id]);

    res.json({ message: "Pricing plan updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating pricing plan" });
  }
});

// Додати новий тариф
router.post("/pricing", authenticateToken, async (req, res) => {
  const { name, price, label, featured, features, result_text } = req.body;
  try {
    const result = await db.run(`
      INSERT INTO pricing_plans (name, price, label, featured, features_json, result_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, price, label, featured ? 1 : 0, JSON.stringify(features), result_text]);
    res.json({ id: result.lastInsertRowid, message: "Pricing plan created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating pricing plan" });
  }
});

// Видалити тариф
router.delete("/pricing/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM pricing_plans WHERE id = ?", [id]);
    res.json({ message: "Pricing plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting pricing plan" });
  }
});

// ЗАХИЩЕНИЙ: Оновлення кроку процесу
router.put("/process/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { step_number, title, description } = req.body;

  try {
    await db.run(`
      UPDATE process_steps 
      SET step_number = ?, title = ?, description = ?
      WHERE id = ?
    `, [step_number, title, description, id]);

    res.json({ message: "Process step updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating process step" });
  }
});

// Додати новий крок процесу
router.post("/process", authenticateToken, async (req, res) => {
  const { step_number, title, description } = req.body;
  try {
    const result = await db.run(`
      INSERT INTO process_steps (step_number, title, description)
      VALUES (?, ?, ?)
    `, [step_number, title, description]);
    res.json({ id: result.lastInsertRowid, message: "Process step created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating process step" });
  }
});

// Видалити крок процесу
router.delete("/process/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM process_steps WHERE id = ?", [id]);
    res.json({ message: "Process step deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting process step" });
  }
});

// ЗАХИЩЕНИЙ: Оновлення картки проблеми
router.put("/problem-cards/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    await db.run(`
      UPDATE problem_cards 
      SET title = ?, description = ?
      WHERE id = ?
    `, [title, description, id]);

    res.json({ message: "Problem card updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating problem card" });
  }
});

// Додати нову картку проблеми
router.post("/problem-cards", authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await db.run(`
      INSERT INTO problem_cards (title, description)
      VALUES (?, ?)
    `, [title, description]);
    res.json({ id: result.lastInsertRowid, message: "Problem card created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating problem card" });
  }
});

// Видалити картку проблеми
router.delete("/problem-cards/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM problem_cards WHERE id = ?", [id]);
    res.json({ message: "Problem card deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting problem card" });
  }
});

// ЗАХИЩЕНИЙ: Оновлення картки переваги
router.put("/benefit-cards/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { icon_name, title, result } = req.body;

  try {
    await db.run(`
      UPDATE benefit_cards 
      SET icon_name = ?, title = ?, result = ?
      WHERE id = ?
    `, [icon_name, title, result, id]);

    res.json({ message: "Benefit card updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating benefit card" });
  }
});

// Додати нову картку переваги
router.post("/benefit-cards", authenticateToken, async (req, res) => {
  const { icon_name, title, result: resultText } = req.body;
  try {
    const dbResult = await db.run(`
      INSERT INTO benefit_cards (icon_name, title, result)
      VALUES (?, ?, ?)
    `, [icon_name, title, resultText]);
    res.json({ id: dbResult.lastInsertRowid, message: "Benefit card created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating benefit card" });
  }
});

// Видалити картку переваги
router.delete("/benefit-cards/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM benefit_cards WHERE id = ?", [id]);
    res.json({ message: "Benefit card deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting benefit card" });
  }
});

// ЗАХИЩЕНИЙ: Оновлення FAQ
router.put("/faq/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  try {
    await db.run(`
      UPDATE faq 
      SET question = ?, answer = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [question, answer, id]);

    res.json({ message: "FAQ updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating FAQ" });
  }
});

// Додати новий FAQ
router.post("/faq", authenticateToken, async (req, res) => {
  const { question, answer } = req.body;

  try {
    const result = await db.run(`
      INSERT INTO faq (question, answer)
      VALUES (?, ?)
    `, [question, answer]);
    res.json({ id: result.lastInsertRowid, message: "FAQ created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating FAQ" });
  }
});

// Видалити FAQ
router.delete("/faq/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM faq WHERE id = ?", [id]);
    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting FAQ" });
  }
});

// --- КЕЙСИ (Спеціальні маршрути для додавання/видалення) ---

// Додати новий кейс
router.post("/cases", authenticateToken, async (req, res) => {
  const { title, niche, image, problem, detailed_problem, solution, detailed_solution, result, link } = req.body;
  
  try {
    const info = await db.run(`
      INSERT INTO cases (title, niche, image, problem, detailed_problem, solution, detailed_solution, result, link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, niche, image, problem, detailed_problem, solution, detailed_solution, result, link]);
    res.status(201).json({ id: info.lastInsertRowid, message: "Кейс створено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при створенні кейсу" });
  }
});

// Видалити кейс
router.delete("/cases/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.run("DELETE FROM cases WHERE id = ?", [id]);
    res.json({ message: "Кейс видалено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при видаленні кейсу" });
  }
});

// --- ЛІДИ (Заявки) ---

// Отримати всі ліди
router.get("/leads/all", authenticateToken, async (req, res) => {
  try {
    const leads = await db.all("SELECT * FROM leads ORDER BY created_at DESC");
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Помилка при отриманні лідів" });
  }
});

// Оновити статус ліда
router.put("/leads/:id/status", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await db.run("UPDATE leads SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Статус ліда оновлено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при оновленні статусу" });
  }
});

// Видалити лід
router.delete("/leads/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM leads WHERE id = ?", [id]);
    res.json({ message: "Лід видалено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при видаленні ліда" });
  }
});

export default router;
