import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

router.get("/me", UserController.getMe);
router.put("/profile", UserController.updateProfile);
router.post("/change-password", UserController.changePassword);
router.post("/deactivate", UserController.deactivateAccount);
router.delete("/account", UserController.deleteAccount);
router.get("/export", UserController.exportUserData);

export default router;
