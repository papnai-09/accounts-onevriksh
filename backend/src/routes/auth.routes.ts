import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { RegisterDto, LoginDto } from "../dtos/auth.dto.js";
import { requireUserSession } from "../middleware/auth.middleware.js";

const router = Router();
const authController = new AuthController();

router.post("/register", validateBody(RegisterDto), (req, res, next) => authController.register(req, res, next));
router.post("/login", validateBody(LoginDto), (req, res, next) => authController.login(req, res, next));
router.post("/logout", (req, res) => authController.logout(req, res));
router.get("/me", requireUserSession, (req, res) => authController.getCurrentUser(req, res));

export default router;
