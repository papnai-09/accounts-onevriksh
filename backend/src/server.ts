import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import ssoRoutes from "./routes/sso.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "https://onevriksh.in",
      "https://accounts.onevriksh.in",
      "https://study.onevriksh.in",
      "https://travel.onevriksh.in",
      "https://crm.onevriksh.in",
      "https://academy.onevriksh.in",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "onevriksh-accounts-backend",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/sso", ssoRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 [Onevriksh Backend] Server running on http://localhost:${PORT}`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.warn("⚠️ [Database] Could not connect to local MongoDB. API server is running on http://localhost:5000.");
  }
}

startServer();
