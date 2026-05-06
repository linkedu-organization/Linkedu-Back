import { Router } from 'express';

import { jobController } from '../controllers/JobController';

export const jobRoutes = Router();

jobRoutes.post('/inatividade', async (req, res) => {
  await jobController.runInatividadeJob(req, res);
});
