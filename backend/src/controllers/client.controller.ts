import { Request, Response, NextFunction } from "express";
import { ClientService } from "../services/client.service.js";

const clientService = new ClientService();

export class ClientController {
  async getClients(_req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await clientService.getAllClients();
      res.status(200).json({ success: true, clients });
    } catch (error) {
      next(error);
    }
  }

  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await clientService.createClient(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.params.clientId as string;
      const client = await clientService.updateClient(clientId, req.body);
      res.status(200).json({ success: true, client });
    } catch (error) {
      next(error);
    }
  }

  async rotateSecret(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.params.clientId as string;
      const result = await clientService.rotateSecret(clientId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.params.clientId as string;
      await clientService.deleteClient(clientId);
      res.status(200).json({ success: true, message: "Client deleted" });
    } catch (error) {
      next(error);
    }
  }
}
