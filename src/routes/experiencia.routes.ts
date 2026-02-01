import { Router } from 'express';

import { experienciaController } from '../controllers/ExperienciaController';

export const experienciaRoutes = Router();

experienciaRoutes.post('/', async (req, res) => {
  await experienciaController.create(req, res);
});

experienciaRoutes.get('/:id', async (req, res) => {
  await experienciaController.getById(req, res);
});

experienciaRoutes.get('/', async (req, res) => {
  await experienciaController.getAll(req, res);
});

experienciaRoutes.put('/:id', async (req, res) => {
  await experienciaController.update(req, res);
});

experienciaRoutes.delete('/:id', async (req, res) => {
  await experienciaController.delete(req, res);
});
