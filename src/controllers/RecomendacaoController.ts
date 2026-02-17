import { Request, Response } from 'express';

import { recomendacaoService } from '../services/RecomendacaoService';

class RecomendacaoController {
  async createRecomendacoesVaga(req: Request, res: Response) {
    const { candidatoId } = req.params;
    const resultado = await recomendacaoService.createRecomendacoesVaga(Number(candidatoId));
    res.status(200).json(resultado);
  }

  async createRecomendacoesCandidato(req: Request, res: Response) {
    const { vagaId } = req.params;
    const resultado = await recomendacaoService.createRecomendacoesCandidato(Number(vagaId));
    res.status(200).json(resultado);
  }

  async getVagas(req: Request, res: Response) {
    const { candidatoId } = req.params;
    const resultado = await recomendacaoService.getVagas(Number(candidatoId));
    res.status(200).json(resultado);
  }

  async getCandidatos(req: Request, res: Response) {
    const { vagaId } = req.params;
    const resultado = await recomendacaoService.getCandidatos(Number(vagaId));
    res.status(200).json(resultado);
  }
}

export const recomendacaoController = new RecomendacaoController();
