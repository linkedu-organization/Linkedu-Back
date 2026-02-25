import { Prisma } from '@prisma/client';

import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';
import { candidatoService } from './CandidatoService';
import { vagaService } from './VagaService';
import { recomendacaoRepository } from '../repositories/RecomendacaoRepository';
import { getAuthTokenId } from '../utils/authUtils';
import { calculaSimilaridade, getVectorEmbedding } from '../utils/matchUtils';

class RecomendacaoService {
  async createRecomendacaoVagas(authToken: unknown): Promise<RecomendacaoVagaResponse[]> {
    const authTokenId = getAuthTokenId(authToken);
    await candidatoService.getById(authTokenId);

    const candidatoEmbedding = await getVectorEmbedding('Candidato', authTokenId);

    if (candidatoEmbedding === '') {
      return [];
    }

    const vagasSimilares = await calculaSimilaridade(
      candidatoEmbedding,
      'Vaga',
      Prisma.sql`("dataExpiracao" IS NULL OR TO_DATE("dataExpiracao", 'DD/MM/YYYY') >= CURRENT_DATE)`,
    );

    if (vagasSimilares.length === 0) {
      return [];
    }

    return recomendacaoRepository.createRecomendacaoVagas(vagasSimilares, authTokenId);
  }

  async createRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    await vagaService.getById(vagaId);
    const vagaEmbedding = await getVectorEmbedding('Vaga', vagaId);

    if (vagaEmbedding === '') {
      return [];
    }

    const candidatosSimilares = await calculaSimilaridade(vagaEmbedding, 'Candidato', Prisma.sql`disponivel = true`);

    if (candidatosSimilares.length === 0) {
      return [];
    }

    return recomendacaoRepository.createRecomendacaoCandidatos(candidatosSimilares, vagaId);
  }

  async getRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    return recomendacaoRepository.getRecomendacaoCandidatos(vagaId);
  }

  async getRecomendacaoVagas(authToken: unknown): Promise<RecomendacaoVagaResponse[]> {
    const authTokenId = getAuthTokenId(authToken);
    await candidatoService.getById(authTokenId);
    return recomendacaoRepository.getRecomendacaoVagas(authTokenId);
  }
}

export const recomendacaoService = new RecomendacaoService();
