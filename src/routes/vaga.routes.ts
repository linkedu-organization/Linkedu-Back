import { Router } from 'express';

import { vagaController } from '../controllers/VagaController';

export const vagaRoutes = Router();

vagaRoutes.post('/', async (req, res) => {
  await vagaController.create(req, res);
});

vagaRoutes.get('/:id', async (req, res) => {
  await vagaController.getById(req, res);
});

vagaRoutes.get('/', async (req, res) => {
  await vagaController.getAll(req, res);
});

vagaRoutes.put('/:id', async (req, res) => {
  await vagaController.update(req, res);
});

vagaRoutes.delete('/:id', async (req, res) => {
  await vagaController.delete(req, res);
});
