import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not defined in environment variables. Authentication may fail.");
}

// ПУБЛІЧНИЙ: Вхід адміністратора
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const CURRENT_JWT_SECRET = process.env.JWT_SECRET;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;

  if (!user) {
    console.error(`Login failed: User '${username}' not found in database.`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  
  if (!isPasswordValid) {
    console.error(`Login failed: Incorrect password for user '${username}'.`);
    // Special recovery: if it's the default admin and login fails, let's log the hash for debugging (safely)
    if (username === 'admin') {
      console.log("Recovery hint: Default admin password should be 'admin123'");
    }
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!CURRENT_JWT_SECRET) {
    console.error("Login failed: JWT_SECRET is missing in environment variables.");
    return res.status(500).json({ message: "Server configuration error" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, CURRENT_JWT_SECRET, { expiresIn: "24h" });

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 години
  });

  res.json({ message: "Logged in successfully", user: { id: user.id, username: user.username } });
});

// ЗАХИЩЕНИЙ: Отримання даних поточного сеансу
router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: (req as any).user });
});

// ПУБЛІЧНИЙ: Вихід
router.post("/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ message: "Logged out successfully" });
});

export default router;
