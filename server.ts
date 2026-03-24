import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDb } from "./server/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

// Routes
import authRoutes from "./server/routes/auth.js";
import contentRoutes from "./server/routes/content.js";
import uploadRoutes from "./server/routes/uploads.js";
import contactRoutes from "./server/routes/contact.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Init Database
  initDb();

  // Ensure uploads directory exists
  const uploadsDir = process.env.UPLOADS_PATH || path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Serve static uploads
  app.use("/uploads", express.static(uploadsDir));

  // API Routes - Ми НЕ навішуємо authenticateToken тут, 
  // бо всередині цих роутерів є публічні маршрути.
  app.use("/api/admin", authRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/contact", contactRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
