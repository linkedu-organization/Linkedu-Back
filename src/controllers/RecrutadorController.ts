import { Request, Response } from 'express';

import { recrutadorService } from '../services/RecrutadorService';
import { getAuthToken } from '../utils/authUtils';

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

  async getAll(req: Request, res: Response) {
    const filters = JSON.parse((req.query?.filters as string) || '[]');
    const sorters = JSON.parse((req.query?.sorters as string) || '[]');

    const result = await recrutadorService.getAll({ filters, sorters });
    res.status(200).json(result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const authToken = getAuthToken(res);

    const result = await recrutadorService.update(Number(id), req.body, authToken);
    res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const authToken = getAuthToken(res);

    await recrutadorService.delete(Number(id), authToken);
    res.status(204).send();
  }
}

export const recrutadorController = new RecrutadorController();
