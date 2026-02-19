import { Request, Response } from 'express';

import { recomendacaoService } from '../services/RecomendacaoService';

class RecomendacaoController {
  async createRecomendacaoVagas(req: Request, res: Response) {
    const { candidatoId } = req.params;
    const resultado = await recomendacaoService.createRecomendacaoVagas(Number(candidatoId));
    res.status(200).json(resultado);
  }

  async createRecomendacaoCandidatos(req: Request, res: Response) {
    const { vagaId } = req.params;
    const resultado = await recomendacaoService.createRecomendacaoCandidatos(Number(vagaId));
    res.status(200).json(resultado);
  }

  async getRecomendacaoVagas(req: Request, res: Response) {
    const { candidatoId } = req.params;
    const resultado = await recomendacaoService.getRecomendacaoVagas(Number(candidatoId));
    res.status(200).json(resultado);
  }

  async getRecomendacaoCandidatos(req: Request, res: Response) {
    const { vagaId } = req.params;
    const resultado = await recomendacaoService.getRecomendacaoCandidatos(Number(vagaId));
    res.status(200).json(resultado);
  }
}

export const recomendacaoController = new RecomendacaoController();
