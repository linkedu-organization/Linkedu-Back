import { Router } from 'express';

import { perfilController } from '../controllers/PerfilController';
import { getAuth, requireAuth } from '../middlewares/authMiddlewares';

export const perfilRoutes = Router();

perfilRoutes.get('/validar-email', async (req, res) => {
  await perfilController.validarEmail(req, res);
});

perfilRoutes.get('/login', async (req, res) => {
  await perfilController.login(req, res);
});

perfilRoutes.get('/autenticado', getAuth, async (req, res) => {
  await perfilController.getPerfilAutenticado(req, res);
});

perfilRoutes.post('/logout', requireAuth, async (req, res) => {
  await perfilController.logout(req, res);
});
