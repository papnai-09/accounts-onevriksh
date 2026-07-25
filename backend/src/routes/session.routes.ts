import { Router } from "express";
import { SessionController } from "../controllers/session.controller.js";
import { requireUserSession } from "../middleware/auth.middleware.js";

const router = Router();
const sessionController = new SessionController();

router.use(requireUserSession);

router.get("/", (req, res, next) => sessionController.getActiveSessions(req, res, next));
router.delete("/other", (req, res, next) => sessionController.terminateOtherSessions(req, res, next));
router.delete("/:sessionId", (req, res, next) => sessionController.terminateSession(req, res, next));

export default router;
