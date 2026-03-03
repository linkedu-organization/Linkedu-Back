import { Request, Response } from 'express';

import { recomendacaoService } from '../services/RecomendacaoService';
import { getAuthToken } from '../utils/authUtils';

class RecomendacaoController {
  async createRecomendacaoVagasParaCandidato(req: Request, res: Response) {
    const authToken = getAuthToken(res);
    const resultado = await recomendacaoService.createRecomendacaoVagasParaCandidato(authToken);
    res.status(200).json(resultado);
  }

  async createRecomendacaoCandidatosParaVaga(req: Request, res: Response) {
    const { vagaId } = req.params;
    const resultado = await recomendacaoService.createRecomendacaoCandidatosParaVaga(Number(vagaId));
    res.status(200).json(resultado);
  }

  async getRecomendacaoVagasParaCandidato(req: Request, res: Response) {
    const authToken = getAuthToken(res);
    const resultado = await recomendacaoService.getRecomendacaoVagasParaCandidato(authToken);
    res.status(200).json(resultado);
  }

  async getRecomendacaoCandidatosParaVaga(req: Request, res: Response) {
    const { vagaId } = req.params;
    const resultado = await recomendacaoService.getRecomendacaoCandidatosParaVaga(Number(vagaId));
    res.status(200).json(resultado);
  }
}

export const recomendacaoController = new RecomendacaoController();
