import { Request, Response } from 'express';

import { experienciaService } from '../services/ExperienciaService';

class ExperienciaController {
  async create(req: Request, res: Response) {
    const result = await experienciaService.create(req.body);
    return res.status(201).json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await experienciaService.getById(Number(id));
    res.status(200).json(result);
  }

  async getAll(req: Request, res: Response) {
    const result = await experienciaService.getAll();
    res.status(200).json(result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const result = await experienciaService.update(Number(id), req.body);
    res.status(200).json(result);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await experienciaService.delete(Number(id));
    res.status(204).send();
  }
}

export const experienciaController = new ExperienciaController();
