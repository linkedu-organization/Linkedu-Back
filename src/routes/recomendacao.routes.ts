import { Router } from 'express';

import { recomendacaoController } from '../controllers/RecomendacaoController';

export const recomendacaoRoutes = Router();

recomendacaoRoutes.post('/vaga/', async (req, res) => {
  await recomendacaoController.createRecomendacaoVagas(req, res);
});

recomendacaoRoutes.post('/candidato/:vagaId', async (req, res) => {
  await recomendacaoController.createRecomendacaoCandidatos(req, res);
});

recomendacaoRoutes.get('/vaga/', async (req, res) => {
  await recomendacaoController.getRecomendacaoVagas(req, res);
});

recomendacaoRoutes.get('/candidato/:vagaId', async (req, res) => {
  await recomendacaoController.getRecomendacaoCandidatos(req, res);
});
