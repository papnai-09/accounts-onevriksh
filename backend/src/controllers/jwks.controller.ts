import { Request, Response } from "express";
import { getJwks } from "../config/jwks.js";

export class JwksController {
  getJwks(_req: Request, res: Response) {
    const jwks = getJwks();
    res.status(200).json(jwks);
  }
}
