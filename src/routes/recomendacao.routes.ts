import { Router } from 'express';

import { recomendacaoController } from '../controllers/RecomendacaoController';
import { ensureIsCandidato, ensureIsRecrutador } from '../middlewares/authMiddlewares';

export const recomendacaoRoutes = Router();

recomendacaoRoutes.post('/vaga/', ensureIsCandidato, async (req, res) => {
  await recomendacaoController.createRecomendacaoVagasParaCandidato(req, res);
});

recomendacaoRoutes.post('/candidato/:vagaId', ensureIsRecrutador, async (req, res) => {
  await recomendacaoController.createRecomendacaoCandidatosParaVaga(req, res);
});

recomendacaoRoutes.get('/vaga/', ensureIsCandidato, async (req, res) => {
  await recomendacaoController.getRecomendacaoVagasParaCandidato(req, res);
});

recomendacaoRoutes.get('/candidato/:vagaId', ensureIsRecrutador, async (req, res) => {
  await recomendacaoController.getRecomendacaoCandidatosParaVaga(req, res);
});
