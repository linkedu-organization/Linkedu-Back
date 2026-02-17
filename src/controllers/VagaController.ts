import { Request, Response } from 'express';

import { vagaService } from '../services/VagaService';

class VagaController {
  async create(req: Request, res: Response) {
    const authToken = res.locals.decryptedToken;

    const result = await vagaService.create(req.body, authToken);
    return res.status(201).json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await vagaService.getById(Number(id));
    res.status(200).json(result);
  }

  async getAll(req: Request, res: Response) {
    const filters = JSON.parse((req.query?.filters as string) || '[]');
    const sorters = JSON.parse((req.query?.sorters as string) || '[]');

    const result = await vagaService.getAll({ filters, sorters });
    res.status(200).json(result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const authToken = res.locals.decryptedToken;

    const result = await vagaService.update(Number(id), req.body, authToken);
    res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const authToken = res.locals.decryptedToken;

    await vagaService.delete(Number(id), authToken);
    res.status(204).send();
  }
}

export const vagaController = new VagaController();
