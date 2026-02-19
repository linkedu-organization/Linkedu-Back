import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';
import { candidatoService } from './CandidatoService';
import { vagaService } from './VagaService';
import { recomendacaoRepository } from '../repositories/RecomendacaoRepository';

class RecomendacaoService {
  async createRecomendacaoVagas(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    await candidatoService.getById(candidatoId);
    // Aqui nas recomendações de vaga poderia pegar o usuário logado, mas deixa assim por enquanto
    return recomendacaoRepository.createRecomendacaoVagas(candidatoId);
  }

  async createRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    await vagaService.getById(vagaId);
    return recomendacaoRepository.createRecomendacaoCandidatos(vagaId);
  }

  async getRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    return recomendacaoRepository.getRecomendacaoCandidatos(vagaId);
  }

  async getRecomendacaoVagas(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    return recomendacaoRepository.getRecomendacaoVagas(candidatoId);
  }
}

export const recomendacaoService = new RecomendacaoService();
