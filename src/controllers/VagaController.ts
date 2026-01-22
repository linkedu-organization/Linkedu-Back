import { Request, Response } from 'express';

import { vagaService } from '../services/VagaService';

class VagaController {
  async create(req: Request, res: Response) {
    const result = await vagaService.create(req.body);
    return res.status(201).json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await vagaService.getById(Number(id));
    res.status(200).json(result);
  }

  async getAll(req: Request, res: Response) {
    const result = await vagaService.getAll();
    res.status(200).json(result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const result = await vagaService.update(Number(id), req.body);
    res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await vagaService.delete(Number(id));
    res.status(204).send();
  }
}

export const vagaController = new VagaController();
