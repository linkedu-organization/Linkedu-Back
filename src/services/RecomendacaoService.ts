import { Prisma } from '@prisma/client';

import { RecomendacaoCandidatoResponseSchema, RecomendacaoVagaResponseSchema } from '../models/RecomendacaoSchema';
import { candidatoService } from './CandidatoService';
import { vagaService } from './VagaService';
import { recomendacaoRepository } from '../repositories/RecomendacaoRepository';
import { getAuthTokenId } from '../utils/authUtils';
import { calcularSimilaridade, getEmbedding } from '../utils/matchUtils';
import { EmbeddingNotFoundError } from '../errors/EmbeddingNotFoundError';

class RecomendacaoService {
  async createRecomendacaoVagasParaCandidato(authToken: unknown) {
    const authTokenId = getAuthTokenId(authToken);
    const candidato = await candidatoService.getById(authTokenId);

    const candidatoEmbedding = await getEmbedding('Candidato', authTokenId);
    if (candidatoEmbedding === '') throw new EmbeddingNotFoundError(authTokenId);

    const vagasSimilares = await calcularSimilaridade(
      'Vaga',
      candidatoEmbedding,
      Prisma.sql`
    ("dataExpiracao" IS NULL OR TO_DATE("dataExpiracao", 'DD/MM/YYYY') >= CURRENT_DATE)
    AND "cargaHoraria" <= ${candidato.tempoDisponivel} AND "instituicao" = ${candidato.instituicao}
    AND "curso" = ${candidato.areaAtuacao}
    AND "ehPublica" = true
  `,
    );
    if (vagasSimilares.length === 0) return [];

    const result = await recomendacaoRepository.createRecomendacaoVagasParaCandidato(vagasSimilares, authTokenId);
    return RecomendacaoVagaResponseSchema.array().parseAsync(result);
  }

  async createRecomendacaoCandidatosParaVaga(vagaId: number) {
    const vaga = await vagaService.getById(vagaId);

    const vagaEmbedding = await getEmbedding('Vaga', vagaId);
    if (vagaEmbedding === '') throw new EmbeddingNotFoundError(vagaId);

    const candidatosSimilares = await calcularSimilaridade(
      'Candidato',
      vagaEmbedding,
      Prisma.sql`"disponivel" = true AND p."ultimoAcesso" >= CURRENT_DATE - INTERVAL '30 days' AND "tempoDisponivel" >= ${vaga.cargaHoraria} AND "instituicao" = ${vaga.instituicao} AND "areaAtuacao" = ${vaga.curso}`,
      Prisma.sql`JOIN (SELECT id as "perfilId", "ultimoAcesso" FROM "Perfil") p ON p."perfilId" = "Candidato"."perfilId"`,
    );
    if (candidatosSimilares.length === 0) return [];

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
