import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import db, { initDb } from "./server/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

// Routes
import authRoutes from "./server/routes/auth.js";
import contentRoutes from "./server/routes/content.js";
import uploadRoutes from "./server/routes/uploads.js";
import contactRoutes from "./server/routes/contact.js";
import statsRoutes from "./server/routes/stats.js";
import articleRoutes from "./server/routes/articles.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Init Database
  await initDb();

  // Ensure uploads directory exists
  const uploadsDir = process.env.UPLOADS_PATH || path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT) {
    app.use((req, res, next) => {
      if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Serve static uploads
  app.use("/uploads", express.static(uploadsDir));

  // Sitemap and Robots
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
  });

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const articles = await db.all("SELECT slug, updated_at FROM articles WHERE is_published = 1");
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Static pages
      const staticPages = ['', '/blog', '/admin'];
      staticPages.forEach(page => {
        sitemap += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
      });

      // Articles
      articles.forEach(art => {
        sitemap += `  <url>\n    <loc>${baseUrl}/blog/${art.slug}</loc>\n    <lastmod>${new Date(art.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      sitemap += `</urlset>`;
      res.type("application/xml");
      res.send(sitemap);
    } catch (err) {
      res.status(500).send("Error generating sitemap");
    }
  });

  // API Routes
  app.use("/api/admin", authRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/articles", articleRoutes);

  // SEO Injection Middleware for Blog - Universal (not just for bots)
  app.get("/blog/:slug", async (req, res, next) => {
    try {
      const article = await db.get("SELECT * FROM articles WHERE slug = ? AND is_published = 1", [req.params.slug]);
      if (article) {
        const distPath = path.join(process.cwd(), "dist");
        const indexPath = path.join(distPath, "index.html");
        
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, "utf-8");
          
          const title = article.seo_title || `${article.title} | Roman Dev Blog`;
          const description = article.seo_description || article.excerpt || "Стаття Roman Dev";
          const image = article.image || '';
          
          // Parse JSON fields safely
          let faq = [];
          try {
            faq = typeof article.faq === 'string' ? JSON.parse(article.faq) : (article.faq || []);
          } catch (e) { faq = []; }

          let systemIncludes = [];
          try {
            systemIncludes = typeof article.system_includes === 'string' ? JSON.parse(article.system_includes) : (article.system_includes || []);
          } catch (e) { systemIncludes = []; }

          let targetAudience = [];
          try {
            targetAudience = typeof article.target_audience === 'string' ? JSON.parse(article.target_audience) : (article.target_audience || []);
          } catch (e) { targetAudience = []; }

          // JSON-LD for Article
          const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": description,
            "image": image,
            "author": {
              "@type": "Person",
              "name": "Roman Dev"
            },
            "datePublished": article.published_at || article.created_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://roman-dev.com/blog/${article.slug}`
            }
          };

          // FAQ JSON-LD
          let faqJsonLd = null;
          if (faq && faq.length > 0) {
            faqJsonLd = {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faq.map((item: any) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer
                }
              }))
            };
          }

          const seoTags = `
            <title>${title}</title>
            <meta name="description" content="${description}">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${image}">
            <meta property="og:type" content="article">
            <link rel="canonical" href="https://roman-dev.com/blog/${article.slug}">
            <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
            ${faqJsonLd ? `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>` : ''}
          `;

          const articleContent = `
            <article style="display:none">
              <h1>${article.title}</h1>
              <div class="excerpt">${article.excerpt}</div>
              <div class="content">${article.content}</div>
              ${faq.length > 0 ? `
                <section class="faq">
                  <h2>FAQ</h2>
                  ${faq.map((f: any) => `<div><h3>${f.question}</h3><p>${f.answer}</p></div>`).join('')}
                </section>
              ` : ''}
              ${systemIncludes.length > 0 ? `
                <section class="includes">
                  <h2>Що входить у систему:</h2>
                  <ul>
                    ${systemIncludes.map((s: any) => `<li>${s}</li>`).join('')}
                  </ul>
                </section>
              ` : ''}
              ${targetAudience.length > 0 ? `
                <section class="audience">
                  <h2>Кому підходить:</h2>
                  <ul>
                    ${targetAudience.map((t: any) => `<li>${t}</li>`).join('')}
                  </ul>
                </section>
              ` : ''}
            </article>
          `;
          
          // Inject into head
          html = html.replace('</head>', `${seoTags}</head>`);
          // Inject into root
          html = html.replace('<div id="root"></div>', `<div id="root">${articleContent}</div>`);
          
          return res.send(html);
        }
      }
    } catch (err) {
      console.error("SEO Injection error:", err);
    }
    next();
  });

  // SEO Injection for Blog List
  app.get("/blog", async (req, res, next) => {
    try {
      const distPath = path.join(process.cwd(), "dist");
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, "utf-8");
        const seoTags = `
          <title>Блог | Roman Dev - Автоматизація та SEO</title>
          <meta name="description" content="Корисні статті про автоматизацію бізнесу, створення сайтів та SEO-стратегії від Roman Dev.">
          <link rel="canonical" href="https://roman-dev.com/blog">
        `;
        html = html.replace('</head>', `${seoTags}</head>`);
        return res.send(html);
      }
    } catch (err) {
      console.error("Blog list SEO error:", err);
    }
    next();
  });

  // SEO Injection for Home
  app.get("/", async (req, res, next) => {
    try {
      const seo = await db.get("SELECT content_json FROM site_content WHERE section_key = 'seo'");
      const seoData = seo ? JSON.parse(seo.content_json) : null;
      
      const distPath = path.join(process.cwd(), "dist");
      const indexPath = path.join(distPath, "index.html");
      
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, "utf-8");
        if (seoData) {
          const seoTags = `
            <title>${seoData.title}</title>
            <meta name="description" content="${seoData.description}">
            <meta property="og:title" content="${seoData.ogTitle || seoData.title}">
            <meta property="og:description" content="${seoData.ogDescription || seoData.description}">
            <meta property="og:image" content="${seoData.ogImage || ''}">
            <link rel="canonical" href="https://roman-dev.com/">
          `;
          html = html.replace('</head>', `${seoTags}</head>`);
        }
        return res.send(html);
      }
    } catch (err) {
      console.error("Home SEO error:", err);
    }
    next();
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT;
  
  if (!isProduction) {
    console.log("Starting in DEVELOPMENT mode with Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      console.error("DIST directory not found! Did you run 'npm run build'?");
    }
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server is pulse-checking on port ${PORT}`);
    console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
  });
}

startServer();
