import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDatabase, getAllData, executeRun, resetToSeedData } from "./server/db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize SQLite database
  await initDatabase();

  // API Route: Get all LEMS data from SQLite
  app.get("/api/data", (req, res) => {
    try {
      const data = getAllData();
      res.json(data);
    } catch (err: any) {
      console.error("[API Error /api/data]:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Execute SQL command (INSERT, UPDATE, DELETE) on SQLite
  app.post("/api/query", (req, res) => {
    try {
      const { sql, params } = req.body;
      if (!sql) {
        return res.status(400).json({ error: "SQL query statement is required" });
      }
      executeRun(sql, params || []);
      res.json({ success: true });
    } catch (err: any) {
      console.error("[API Error /api/query]:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Reset SQLite database to initial seed state
  app.post("/api/reset-db", async (req, res) => {
    try {
      await resetToSeedData();
      res.json({ success: true, data: getAllData() });
    } catch (err: any) {
      console.error("[API Error /api/reset-db]:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "SQLite" });
  });

  // Vite middleware for development vs static build serving for production
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
    console.log(`[LEMS Express Server] Running with SQLite on http://0.0.0.0:${PORT}`);
  });
}

startServer();
