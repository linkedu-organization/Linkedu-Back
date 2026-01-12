import { Router } from 'express';

import { perfilController } from '../controllers/PerfilController';

export const perfilRoutes = Router();

perfilRoutes.post('/validar-email', async (req, res) => {
  await perfilController.validarEmail(req, res);
});
