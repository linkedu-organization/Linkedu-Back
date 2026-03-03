import { Prisma, TipoRecomendacao } from '@prisma/client';

import prisma from '../utils/prisma';
import { getRecomendacaoVagasPayload, getRecomendacaoCandidatosPayload, Similaridade } from '../utils/matchUtils';
import { vagaRepository } from './VagaRepository';
import { candidatoRepository } from './CandidatoRepository';

class RecomendacaoRepository {
  async createRecomendacaoVagasParaCandidato(vagasSimilares: Similaridade[], candidatoId: number) {
    const recomendacoes = await getRecomendacaoVagasPayload(vagasSimilares, candidatoId);
    await this.deleteRecomendacao('candidatoId', candidatoId, 'VAGAS_PARA_CANDIDATO');
    await this.createRecomendacao(recomendacoes);
    return recomendacoes.map(obj => ({ ...obj, vaga: vagaRepository.getById(obj.vagaId) }));
  }

  async createRecomendacaoCandidatosParaVaga(candidatosSimilares: Similaridade[], vagaId: number) {
    const recomendacoes = await getRecomendacaoCandidatosPayload(candidatosSimilares, vagaId);
    await this.deleteRecomendacao('vagaId', vagaId, 'CANDIDATOS_PARA_VAGA');
    await this.createRecomendacao(recomendacoes);
    return recomendacoes.map(obj => ({
      ...obj,
      candidato: candidatoRepository.getById(obj.candidatoId),
    }));
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
