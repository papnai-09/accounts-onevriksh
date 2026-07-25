import { Router } from "express";
import { SessionController } from "../controllers/session.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", SessionController.getActiveSessions);
router.delete("/other", SessionController.logoutOtherDevices);
router.delete("/:id", SessionController.revokeSession);
router.get("/history", SessionController.getLoginHistory);

export default router;
