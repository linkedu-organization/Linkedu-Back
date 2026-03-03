import { Prisma } from '@prisma/client';

import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';
import prisma from '../utils/prisma';
import {
  salvaNovasRecomendacoes,
  getVagasPayload,
  getCandidatosPayload,
  deletaRecomendacoes,
  Similaridade,
} from '../utils/matchUtils';

class RecomendacaoRepository {
  async createRecomendacaoVagasParaCandidato(
    vagasSimilares: Similaridade[],
    candidatoId: number,
  ): Promise<RecomendacaoVagaResponse[]> {
    const vagas = await getVagasPayload(vagasSimilares, candidatoId);

    deletaRecomendacoes('candidatoId', candidatoId, 'VAGAS_PARA_CANDIDATO');

    const recomendacoes = vagas.map(item => ({
      vagaId: item.vagaId,
      candidatoId: item.candidatoId,
      tipo: item.tipo,
      score: item.score!,
      descricao: item.descricao,
      updatedAt: item.updatedAt,
    }));

    salvaNovasRecomendacoes(recomendacoes);

    return vagas;
  }

  async createRecomendacaoCandidatosParaVaga(
    candidatosSimilares: Similaridade[],
    vagaId: number,
  ): Promise<RecomendacaoCandidatoResponse[]> {
    const candidatos = await getCandidatosPayload(candidatosSimilares, vagaId);

    deletaRecomendacoes('vagaId', vagaId, 'CANDIDATOS_PARA_VAGA');

    const recomendacoes = candidatos
      .filter((item): item is RecomendacaoCandidatoResponse => item !== null && item.score !== null)
      .map(item => ({
        vagaId: item.vagaId,
        candidatoId: item.candidatoId,
        tipo: item.tipo,
        score: item.score!,
        descricao: item.descricao,
        updatedAt: item.updatedAt,
      }));

    salvaNovasRecomendacoes(recomendacoes);

    return candidatos;
  }

  async getRecomendacaoCandidatosParaVaga(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    const salvos = await prisma.recomendacao.findMany({
      where: {
        vagaId: vagaId,
        tipo: 'CANDIDATOS_PARA_VAGA',
      },
      include: { candidato: { include: { perfil: true, experiencias: true } } },
      orderBy: { score: 'desc' },
    });

    return salvos as RecomendacaoCandidatoResponse[];
  }

  async getRecomendacaoVagasParaCandidato(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    const salvos = await prisma.recomendacao.findMany({
      where: {
        candidatoId: candidatoId,
        tipo: 'VAGAS_PARA_CANDIDATO',
      },
      include: { vaga: { include: { recrutador: { include: { perfil: true } } } } },
      orderBy: { score: 'desc' },
    });

    return salvos as RecomendacaoVagaResponse[];
  }

  async deleteByCandidatoId(tx: Prisma.TransactionClient, candidatoId: number) {
    await tx.recomendacao.deleteMany({
      where: { candidatoId },
    });
  }

  async deleteByVagaId(vagaId: number) {
    await prisma.recomendacao.deleteMany({
      where: { vagaId },
    });
  }
}

export const recomendacaoRepository = new RecomendacaoRepository();
