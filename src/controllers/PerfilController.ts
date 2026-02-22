import { Request, Response } from 'express';

import { perfilService } from '../services/PerfilService';
import { COOKIE_EXPIRATION_MS, getAuthToken } from '../utils/authUtils';

class PerfilController {
  async validarEmail(req: Request, res: Response) {
    const email = req.query.email as string;
    await perfilService.validarEmail(email);
    res.status(200).json({ mensagem: 'Email disponível' });
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body;
    const token = await perfilService.login(email, senha);

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: COOKIE_EXPIRATION_MS,
    });

    res.status(200).send();
  }

  async getPerfilAutenticado(req: Request, res: Response) {
    const authToken = getAuthToken(res);
    const result = await perfilService.getPerfilAutenticado(authToken);
    res.status(200).json(result);
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('authToken');
    res.status(200).send();
  }
}

export const perfilController = new PerfilController();
