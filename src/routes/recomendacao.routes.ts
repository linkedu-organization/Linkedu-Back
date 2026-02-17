import { Router } from 'express';

import { recomendacaoController } from '../controllers/RecomendacaoController';

export const recomendacaoRoutes = Router();

recomendacaoRoutes.post('/vaga/:candidatoId', async (req, res) => {
  await recomendacaoController.createRecomendacoesVaga(req, res);
});

recomendacaoRoutes.post('/candidato/:vagaId', async (req, res) => {
  await recomendacaoController.createRecomendacoesCandidato(req, res);
});

recomendacaoRoutes.get('/vaga/:candidatoId', async (req, res) => {
  await recomendacaoController.getVagas(req, res);
});

recomendacaoRoutes.get('/candidato/:vagaId', async (req, res) => {
  await recomendacaoController.getCandidatos(req, res);
});
