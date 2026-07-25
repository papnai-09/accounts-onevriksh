import { Router } from "express";
import { OidcController } from "../controllers/oidc.controller.js";
import { JwksController } from "../controllers/jwks.controller.js";

const router = Router();
const oidcController = new OidcController();
const jwksController = new JwksController();

router.get("/openid-configuration", (req, res) => oidcController.getDiscoveryDocument(req, res));
router.get("/jwks.json", (req, res) => jwksController.getJwks(req, res));

export default router;
