import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { initJwks } from "./config/jwks.js";
import authRoutes from "./routes/auth.routes.js";
import oauthRoutes from "./routes/oauth.routes.js";
import wellKnownRoutes from "./routes/wellKnown.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import clientRoutes from "./routes/client.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or matching onevriksh domains
      if (!origin || origin.includes("onevriksh") || origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive CORS for dev; validated in OAuth controller per client allowedOrigins
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Discovery & Public Endpoints
app.use("/.well-known", wellKnownRoutes);
app.use("/api/oauth/jwks", wellKnownRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/user", userRoutes);

// Health Check Endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "onevriksh-accounts-backend",
    version: "2.1.0",
    features: ["OAuth 2.1", "OIDC", "PKCE", "RS256 JWKS", "SSO"],
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    await initJwks();
    await connectDB();
  } catch (error) {
    console.warn("⚠️ Database or JWKS init warning:", error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 [OneVriksh IdP] Identity Provider running on http://localhost:${PORT}`);
    console.log(`🔑 [OIDC Discovery] http://localhost:${PORT}/.well-known/openid-configuration`);
    console.log(`🔐 [JWKS Endpoint] http://localhost:${PORT}/.well-known/jwks.json`);
  });
}

startServer();
