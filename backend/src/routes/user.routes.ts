import { Router } from "express";
import { ConsentController } from "../controllers/consent.controller.js";
import { requireUserSession } from "../middleware/auth.middleware.js";

const router = Router();
const consentController = new ConsentController();

router.use(requireUserSession);

// Connected applications
router.get("/connected-apps", (req, res, next) => consentController.getConnectedApps(req, res, next));
router.delete("/connected-apps/:clientId", (req, res, next) => consentController.revokeConsent(req, res, next));

export default router;
