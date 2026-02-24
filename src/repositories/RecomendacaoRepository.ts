import { Prisma } from '@prisma/client';

import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';
import prisma from '../utils/prisma';
import {
  salvaNovasRecomendacoes,
  calculaSimilaridade,
  getVagasPayload,
  getCandidatoPayload,
  deletaRecomendacoes,
  getVectorEmbedding,
} from '../utils/matchUtils';

class RecomendacaoRepository {
  async createRecomendacaoVagas(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    const embeddingCandidato = await getVectorEmbedding('Candidato', candidatoId);

    if (embeddingCandidato === '') {
      return [];
    }

    const vagasRecomendadas = await calculaSimilaridade(
      embeddingCandidato,
      'Vaga',
      Prisma.sql`("dataExpiracao" IS NULL OR TO_DATE("dataExpiracao", 'DD/MM/YYYY') >= CURRENT_DATE)`,
    );

    if (vagasRecomendadas.length === 0) return [];

    const resultadoFinal = await getVagasPayload(vagasRecomendadas, candidatoId);
    deletaRecomendacoes('candidatoId', candidatoId, 'VAGAS_PARA_CANDIDATO');

    const dadosParaSalvar = resultadoFinal.map(item => ({
      vagaId: item.vagaId,
      candidatoId: item.candidatoId,
      tipo: item.tipo,
      score: item.score!,
      descricao: item.descricao,
      updatedAt: item.updatedAt,
    }));

    if (dadosParaSalvar.length > 0) {
      await salvaNovasRecomendacoes(dadosParaSalvar);
    }

    return resultadoFinal;
  }

  async createRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    const vagaEmbedding = await getVectorEmbedding('Vaga', vagaId);

    if (vagaEmbedding === '') {
      return [];
    }

    const cadidatosParaVaga = await calculaSimilaridade(vagaEmbedding, 'Candidato', Prisma.sql`disponivel = true`);

    if (cadidatosParaVaga.length === 0) return [];

    const resultadoFinal = await getCandidatoPayload(cadidatosParaVaga, vagaId);

    deletaRecomendacoes('vagaId', vagaId, 'CANDIDATOS_PARA_VAGA');

    const dadosParaSalvar = resultadoFinal
      .filter((item): item is RecomendacaoCandidatoResponse => item !== null && item.score !== null)
      .map(item => ({
        vagaId: item.vagaId,
        candidatoId: item.candidatoId,
        tipo: item.tipo,
        score: item.score!,
        descricao: item.descricao,
        updatedAt: item.updatedAt,
      }));

    await salvaNovasRecomendacoes(dadosParaSalvar);

    return resultadoFinal;
  }

  async getRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    const salvos = await prisma.recomendacao.findMany({
      where: {
        vagaId: vagaId,
        tipo: 'CANDIDATOS_PARA_VAGA',
      },
      include: {
        candidato: {
          include: {
            perfil: true,
            experiencias: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    });

    return salvos as unknown as RecomendacaoCandidatoResponse[];
  }

  async getRecomendacaoVagas(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    const salvos = await prisma.recomendacao.findMany({
      where: {
        candidatoId: candidatoId,
        tipo: 'VAGAS_PARA_CANDIDATO',
      },
      include: {
        vaga: {
          include: {
            recrutador: { include: { perfil: true } },
          },
        },
      },
      orderBy: { score: 'desc' },
    });

    return salvos as unknown as RecomendacaoVagaResponse[];
  }
}

export const recomendacaoRepository = new RecomendacaoRepository();
