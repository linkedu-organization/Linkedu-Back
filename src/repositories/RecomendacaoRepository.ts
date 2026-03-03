import { Prisma } from '@prisma/client';

import prisma from '../utils/prisma';
import {
  salvaNovasRecomendacoes,
  getVagasPayload,
  getCandidatosPayload,
  deletaRecomendacoes,
  Similaridade,
} from '../utils/matchUtils';

class RecomendacaoRepository {
  async createRecomendacaoVagasParaCandidato(vagasSimilares: Similaridade[], candidatoId: number) {
    const vagas = await getVagasPayload(vagasSimilares, candidatoId);
    deletaRecomendacoes('candidatoId', candidatoId, 'VAGAS_PARA_CANDIDATO');
    salvaNovasRecomendacoes(vagas);
    return vagas;
  }

  async createRecomendacaoCandidatosParaVaga(candidatosSimilares: Similaridade[], vagaId: number) {
    const candidatos = await getCandidatosPayload(candidatosSimilares, vagaId);
    deletaRecomendacoes('vagaId', vagaId, 'CANDIDATOS_PARA_VAGA');
    salvaNovasRecomendacoes(candidatos);
    return candidatos;
  }

  async getRecomendacaoVagasParaCandidato(candidatoId: number) {
    return prisma.recomendacao.findMany({
      where: {
        candidatoId: candidatoId,
        tipo: 'VAGAS_PARA_CANDIDATO',
      },
      include: { vaga: { include: { recrutador: { include: { perfil: true } } } } },
      orderBy: { score: 'desc' },
    });
  }

  async getRecomendacaoCandidatosParaVaga(vagaId: number) {
    return prisma.recomendacao.findMany({
      where: {
        vagaId: vagaId,
        tipo: 'CANDIDATOS_PARA_VAGA',
      },
      include: { candidato: { include: { perfil: true, experiencias: true } } },
      orderBy: { score: 'desc' },
    });
  }

  async deleteByCandidatoId(tx: Prisma.TransactionClient, candidatoId: number) {
    return tx.recomendacao.deleteMany({
      where: { candidatoId },
    });
  }

  async deleteByVagaId(tx: Prisma.TransactionClient, vagaId: number) {
    return tx.recomendacao.deleteMany({
      where: { vagaId },
    });
  }
}

export const recomendacaoRepository = new RecomendacaoRepository();
