import { Router } from 'express';

import { recomendacaoController } from '../controllers/RecomendacaoController';
import { ensureIsCandidato, ensureIsRecrutador } from '../middlewares/authMiddlewares';

export const recomendacaoRoutes = Router();

recomendacaoRoutes.post('/vagas-para-candidato/', ensureIsCandidato, async (req, res) => {
  await recomendacaoController.createRecomendacaoVagasParaCandidato(req, res);
});

recomendacaoRoutes.post('/candidatos-para-vaga/:vagaId', ensureIsRecrutador, async (req, res) => {
  await recomendacaoController.createRecomendacaoCandidatosParaVaga(req, res);
});

recomendacaoRoutes.get('/vagas-para-candidato/', ensureIsCandidato, async (req, res) => {
  await recomendacaoController.getRecomendacaoVagasParaCandidato(req, res);
});

recomendacaoRoutes.get('/candidatos-para-vaga/:vagaId', ensureIsRecrutador, async (req, res) => {
  await recomendacaoController.getRecomendacaoCandidatosParaVaga(req, res);
});
