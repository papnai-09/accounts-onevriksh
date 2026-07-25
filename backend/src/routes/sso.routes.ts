import { Router } from "express";
import { SsoController } from "../controllers/sso.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/authorize", authenticateJWT, SsoController.createAuthorizationCode);
router.post("/token", SsoController.exchangeCode);

export default router;
