import { Request, Response } from 'express';

import { candidatoService } from '../services/CandidatoService';

class CandidatoController {
  async create(req: Request, res: Response) {
    const result = await candidatoService.create(req.body);
    return res.status(201).json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await candidatoService.getById(Number(id));
    res.status(200).json(result);
  }

  async getAll(req: Request, res: Response) {
    const result = await candidatoService.getAll();
    res.status(200).json(result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const result = await candidatoService.update(Number(id), req.body);
    res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await candidatoService.delete(Number(id));
    res.status(204).send();
  }
}

export const candidatoController = new CandidatoController();
