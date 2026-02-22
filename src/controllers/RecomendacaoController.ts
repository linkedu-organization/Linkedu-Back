import { Request, Response } from 'express';

import { recomendacaoService } from '../services/RecomendacaoService';
import { getAuthToken } from '../utils/authUtils';

class RecomendacaoController {
  async createRecomendacaoVagas(req: Request, res: Response) {
    const authToken = getAuthToken(res);
    const resultado = await recomendacaoService.createRecomendacaoVagas(authToken);
    res.status(200).json(resultado);
  }

  async createRecomendacaoCandidatos(req: Request, res: Response) {
    const { vagaId } = req.params;
    const resultado = await recomendacaoService.createRecomendacaoCandidatos(Number(vagaId));
    res.status(200).json(resultado);
  }

  async getRecomendacaoVagas(req: Request, res: Response) {
    const authToken = getAuthToken(res);
    const resultado = await recomendacaoService.getRecomendacaoVagas(authToken);
    res.status(200).json(resultado);
  }

  async getRecomendacaoCandidatos(req: Request, res: Response) {
    const { vagaId } = req.params;
    const resultado = await recomendacaoService.getRecomendacaoCandidatos(Number(vagaId));
    res.status(200).json(resultado);
  }
}

export const recomendacaoController = new RecomendacaoController();
