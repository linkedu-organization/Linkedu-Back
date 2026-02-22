import { Router } from 'express';

import { vagaController } from '../controllers/VagaController';
import { ensureIsRecrutador } from '../middlewares/authMiddlewares';

export const vagaRoutes = Router();

vagaRoutes.post('/', ensureIsRecrutador, async (req, res) => {
  await vagaController.create(req, res);
});

vagaRoutes.get('/:id', async (req, res) => {
  await vagaController.getById(req, res);
});

vagaRoutes.get('/', async (req, res) => {
  await vagaController.getAll(req, res);
});

vagaRoutes.put('/:id', ensureIsRecrutador, async (req, res) => {
  await vagaController.update(req, res);
});

vagaRoutes.delete('/:id', ensureIsRecrutador, async (req, res) => {
  await vagaController.delete(req, res);
});
