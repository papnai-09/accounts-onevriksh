import { Router } from "express";
import { OAuthController } from "../controllers/oauth.controller.js";
import { TokenController } from "../controllers/token.controller.js";
import { optionalUserSession } from "../middleware/auth.middleware.js";

const router = Router();
const oauthController = new OAuthController();
const tokenController = new TokenController();

router.get("/authorize", optionalUserSession, (req, res, next) => oauthController.authorize(req, res, next));
router.post("/authorize", optionalUserSession, (req, res, next) => oauthController.authorize(req, res, next));
router.post("/token", (req, res, next) => tokenController.issueTokens(req, res, next));

export default router;
