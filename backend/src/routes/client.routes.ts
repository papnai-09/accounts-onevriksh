import { Router } from "express";
import { ClientController } from "../controllers/client.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { CreateClientDto, UpdateClientDto } from "../dtos/client.dto.js";

const router = Router();
const clientController = new ClientController();

router.get("/", (req, res, next) => clientController.getClients(req, res, next));
router.post("/", validateBody(CreateClientDto), (req, res, next) => clientController.createClient(req, res, next));
router.put("/:clientId", validateBody(UpdateClientDto), (req, res, next) => clientController.updateClient(req, res, next));
router.post("/:clientId/rotate-secret", (req, res, next) => clientController.rotateSecret(req, res, next));
router.delete("/:clientId", (req, res, next) => clientController.deleteClient(req, res, next));

export default router;
