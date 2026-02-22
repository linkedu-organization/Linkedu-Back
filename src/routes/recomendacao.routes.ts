import { Router } from 'express';

import { recomendacaoController } from '../controllers/RecomendacaoController';
import { ensureIsCandidato, ensureIsRecrutador } from '../middlewares/authMiddlewares';

export const recomendacaoRoutes = Router();

recomendacaoRoutes.post('/vaga/', ensureIsCandidato, async (req, res) => {
  await recomendacaoController.createRecomendacaoVagas(req, res);
});

recomendacaoRoutes.post('/candidato/:vagaId', ensureIsRecrutador, async (req, res) => {
  await recomendacaoController.createRecomendacaoCandidatos(req, res);
});

recomendacaoRoutes.get('/vaga/', ensureIsCandidato, async (req, res) => {
  await recomendacaoController.getRecomendacaoVagas(req, res);
});

recomendacaoRoutes.get('/candidato/:vagaId', ensureIsRecrutador, async (req, res) => {
  await recomendacaoController.getRecomendacaoCandidatos(req, res);
});
