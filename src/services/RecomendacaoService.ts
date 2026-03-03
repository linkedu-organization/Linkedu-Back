import { Prisma } from '@prisma/client';

import { RecomendacaoCandidatoResponseSchema, RecomendacaoVagaResponseSchema } from '../models/RecomendacaoSchema';
import { candidatoService } from './CandidatoService';
import { vagaService } from './VagaService';
import { recomendacaoRepository } from '../repositories/RecomendacaoRepository';
import { getAuthTokenId } from '../utils/authUtils';
import { calculaSimilaridade, getVectorEmbedding } from '../utils/matchUtils';

class RecomendacaoService {
  async createRecomendacaoVagasParaCandidato(authToken: unknown) {
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

    const result = await recomendacaoRepository.createRecomendacaoVagasParaCandidato(vagasSimilares, authTokenId);
    return RecomendacaoVagaResponseSchema.array().parseAsync(result);
  }

  async createRecomendacaoCandidatosParaVaga(vagaId: number) {
    await vagaService.getById(vagaId);
    const vagaEmbedding = await getVectorEmbedding('Vaga', vagaId);

    if (vagaEmbedding === '') {
      return [];
    }

    const candidatosSimilares = await calculaSimilaridade(vagaEmbedding, 'Candidato', Prisma.sql`disponivel = true`);

    if (candidatosSimilares.length === 0) {
      return [];
    }

    const result = await recomendacaoRepository.createRecomendacaoCandidatosParaVaga(candidatosSimilares, vagaId);
    return RecomendacaoCandidatoResponseSchema.array().parseAsync(result);
  }

  async getRecomendacaoVagasParaCandidato(authToken: unknown) {
    const authTokenId = getAuthTokenId(authToken);
    await candidatoService.getById(authTokenId);
    const result = await recomendacaoRepository.getRecomendacaoVagasParaCandidato(authTokenId);
    return RecomendacaoVagaResponseSchema.array().parseAsync(result);
  }

  async getRecomendacaoCandidatosParaVaga(vagaId: number) {
    const result = await recomendacaoRepository.getRecomendacaoCandidatosParaVaga(vagaId);
    return RecomendacaoCandidatoResponseSchema.array().parseAsync(result);
  }
}

export const recomendacaoService = new RecomendacaoService();
