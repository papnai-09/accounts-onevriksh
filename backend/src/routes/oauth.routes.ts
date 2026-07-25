import { Router } from "express";
import { OAuthController } from "../controllers/oauth.controller.js";
import { TokenController } from "../controllers/token.controller.js";
import { UserInfoController } from "../controllers/userinfo.controller.js";
import { LogoutController } from "../controllers/logout.controller.js";
import { RevocationController } from "../controllers/revocation.controller.js";
import { IntrospectionController } from "../controllers/introspection.controller.js";
import { optionalUserSession, requireUserSession, requireBearerToken } from "../middleware/auth.middleware.js";

const router = Router();
const oauthController = new OAuthController();
const tokenController = new TokenController();
const userinfoController = new UserInfoController();
const logoutController = new LogoutController();
const revocationController = new RevocationController();
const introspectionController = new IntrospectionController();

// Authorization Endpoint
router.get("/authorize", optionalUserSession, (req, res, next) => oauthController.authorize(req, res, next));
router.post("/consent", requireUserSession, (req, res, next) => oauthController.processConsent(req, res, next));

// Token Endpoint
router.post("/token", (req, res, next) => tokenController.issueTokens(req, res, next));

// UserInfo Endpoint
router.get("/userinfo", requireBearerToken, (req, res) => userinfoController.getUserInfo(req, res));
router.post("/userinfo", requireBearerToken, (req, res) => userinfoController.getUserInfo(req, res));

// Revocation Endpoint
router.post("/revoke", (req, res) => revocationController.revoke(req, res));

// Introspection Endpoint
router.post("/introspect", (req, res) => introspectionController.introspect(req, res));

// Logout Endpoint
router.get("/logout", (req, res) => logoutController.logout(req, res));
router.post("/logout", (req, res) => logoutController.logout(req, res));

export default router;
