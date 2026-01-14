import { Router } from 'express';

import { candidatoController } from '../controllers/CandidatoController';

export const candidatoRoutes = Router();

candidatoRoutes.post('/', async (req, res) => {
  await candidatoController.create(req, res);
});

candidatoRoutes.get('/:id', async (req, res) => {
  await candidatoController.getById(req, res);
});

candidatoRoutes.get('/', async (req, res) => {
  await candidatoController.getAll(req, res);
});

candidatoRoutes.put('/:id', async (req, res) => {
  await candidatoController.update(req, res);
});

candidatoRoutes.delete('/:id', async (req, res) => {
  await candidatoController.delete(req, res);
});
