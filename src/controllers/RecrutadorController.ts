import { Request, Response } from 'express';

import { recrutadorService } from '../services/RecrutadorService';

class RecrutadorController {
  async create(req: Request, res: Response) {
    const result = await recrutadorService.create(req.body);
    return res.status(201).json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await recrutadorService.getById(Number(id));
    res.status(200).json(result);
  }
}

export const recrutadorController = new RecrutadorController();
