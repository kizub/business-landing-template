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
  const username = req.body.username?.trim();
  const password = req.body.password?.trim();
  const CURRENT_JWT_SECRET = process.env.JWT_SECRET?.trim();

  console.log(`Login attempt for user: [${username}]`);
  console.log(`Environment check: JWT_SECRET exists: ${!!CURRENT_JWT_SECRET}, NODE_ENV: ${process.env.NODE_ENV}`);

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Case-insensitive search for better UX, but we'll check exact match if needed
  const user = db.prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?)").get(username) as any;

  if (!user) {
    console.error(`Login failed: User '${username}' not found in database.`);
    // Log available users for debugging (only in dev/debug mode)
    const allUsers = db.prepare("SELECT username FROM users").all();
    console.log("Available users in DB:", allUsers.map((u: any) => u.username));
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  
  if (!isPasswordValid) {
    console.error(`Login failed: Incorrect password for user '${username}'.`);
    console.log(`Debug: Input password length: ${password.length}, DB hash length: ${user.password?.length || 0}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!CURRENT_JWT_SECRET) {
    console.error("Login failed: JWT_SECRET is missing or empty in environment variables.");
    return res.status(500).json({ message: "Server configuration error" });
  }

  console.log("Login successful, signing token...");
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
