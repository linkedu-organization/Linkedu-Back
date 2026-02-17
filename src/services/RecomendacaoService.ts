import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';
import { candidatoService } from './CandidatoService';
import { vagaService } from './VagaService';
import { recomendacaoRepository } from '../repositories/RecomendacaoRepository';

class RecomendacaoService {
  async createRecomendacoesVaga(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    await candidatoService.getById(candidatoId);
    return recomendacaoRepository.createRecomendacoesVaga(candidatoId);
  }

  async createRecomendacoesCandidato(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    await vagaService.getById(vagaId);
    return recomendacaoRepository.createRecomendacoesCandidato(vagaId);
  }

  async getCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    return recomendacaoRepository.getCandidatos(vagaId);
  }

  async getVagas(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    return recomendacaoRepository.getVagas(candidatoId);
  }
}

export const recomendacaoService = new RecomendacaoService();
