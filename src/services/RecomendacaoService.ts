import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';
import { candidatoService } from './CandidatoService';
import { vagaService } from './VagaService';
import { recomendacaoRepository } from '../repositories/RecomendacaoRepository';
import { getAuthTokenId } from '../utils/authUtils';

class RecomendacaoService {
  async createRecomendacaoVagas(authToken: unknown): Promise<RecomendacaoVagaResponse[]> {
    const authTokenId = getAuthTokenId(authToken);
    await candidatoService.getById(authTokenId);
    return recomendacaoRepository.createRecomendacaoVagas(authTokenId);
  }

  async createRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    await vagaService.getById(vagaId);
    return recomendacaoRepository.createRecomendacaoCandidatos(vagaId);
  }

  async getRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    return recomendacaoRepository.getRecomendacaoCandidatos(vagaId);
  }

  async getRecomendacaoVagas(authToken: unknown): Promise<RecomendacaoVagaResponse[]> {
    const authTokenId = getAuthTokenId(authToken);
    return recomendacaoRepository.getRecomendacaoVagas(authTokenId);
  }
}

export const recomendacaoService = new RecomendacaoService();
