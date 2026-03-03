import { Prisma, TipoRecomendacao } from '@prisma/client';

import prisma from '../utils/prisma';
import { getVagasPayload, getCandidatosPayload, Similaridade } from '../utils/matchUtils';

class RecomendacaoRepository {
  async createRecomendacaoVagasParaCandidato(vagasSimilares: Similaridade[], candidatoId: number) {
    const vagas = await getVagasPayload(vagasSimilares, candidatoId);
    this.deleteRecomendacao('candidatoId', candidatoId, 'VAGAS_PARA_CANDIDATO');
    this.createRecomendacao(vagas);
    return vagas;
  }

  async createRecomendacaoCandidatosParaVaga(candidatosSimilares: Similaridade[], vagaId: number) {
    const candidatos = await getCandidatosPayload(candidatosSimilares, vagaId);
    this.deleteRecomendacao('vagaId', vagaId, 'CANDIDATOS_PARA_VAGA');
    this.createRecomendacao(candidatos);
    return candidatos;
  }

  async createRecomendacao(dados: Prisma.RecomendacaoCreateManyInput[]) {
    await prisma.recomendacao.createMany({
      data: dados,
      skipDuplicates: true,
    });
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

  async deleteRecomendacao(entidade: 'vagaId' | 'candidatoId', id: number, tipo: TipoRecomendacao) {
    return prisma.recomendacao.deleteMany({
      where: {
        [entidade]: id,
        tipo: tipo,
      },
    });
  }
}

export const recomendacaoRepository = new RecomendacaoRepository();
