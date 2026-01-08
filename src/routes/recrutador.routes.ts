import { Router } from 'express';

import { recrutadorController } from '../controllers/RecrutadorController';

export const recrutadorRoutes = Router();

recrutadorRoutes.post('/', async (req, res) => {
  await recrutadorController.create(req, res);
});

recrutadorRoutes.get('/:id', async (req, res) => {
  await recrutadorController.getById(req, res);
});
