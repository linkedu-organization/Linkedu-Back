import { Router } from 'express';

import { recrutadorController } from '../controllers/RecrutadorController';
import { ensureIsRecrutador } from '../middlewares/authMiddlewares';

export const recrutadorRoutes = Router();

recrutadorRoutes.post('/', async (req, res) => {
  await recrutadorController.create(req, res);
});

recrutadorRoutes.get('/:id', async (req, res) => {
  await recrutadorController.getById(req, res);
});

recrutadorRoutes.get('/', async (req, res) => {
  await recrutadorController.getAll(req, res);
});

recrutadorRoutes.put('/:id', ensureIsRecrutador, async (req, res) => {
  await recrutadorController.update(req, res);
});

recrutadorRoutes.delete('/:id', ensureIsRecrutador, async (req, res) => {
  await recrutadorController.delete(req, res);
});
