import { Request, Response } from 'express';

import { perfilService } from '../services/PerfilService';

class PerfilController {
  async validarEmail(req: Request, res: Response) {
    const email = req.query.email as string;
    await perfilService.validarEmail(email);
    res.status(200).json({ mensagem: 'Email disponível' });
  }
}

export const perfilController = new PerfilController();
