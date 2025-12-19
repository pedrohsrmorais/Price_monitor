import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import scrapperRoutes from "./routes/scrapper.routes.js";
import productsRoutes from "./routes/products.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";

dotenv.config();

const app = express();

/**
 * ES Modules __dirname fix
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CORS
 */
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
  "https://scrapper.prometio.com.br",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

app.use(express.json());

/**
 * API routes
 */
app.use("/api/auth", authRoutes);
app.use("/api", scrapperRoutes);
app.use("/api", productsRoutes);
app.use("/api", marketplaceRoutes);
app.use("/api", jobsRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// React build
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback (Express 5 safe)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API + React running on port ${PORT}`);
});
