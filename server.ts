import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./src/server/routes.ts";

async function startServer() {
  const requiredEnvVars = [
    'SQL_HOST', 'SQL_USER', 'SQL_PASSWORD', 'SQL_DB_NAME',
    'GEMINI_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
    'FIREBASE_SERVICE_ACCOUNT_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`FATAL ERROR: Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.use("/api", apiRouter);

  // Health route
  app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "GiftJoy API is running" });
  });

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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
