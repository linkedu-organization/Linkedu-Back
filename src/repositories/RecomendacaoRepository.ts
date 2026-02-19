import { Prisma, TipoRecomendacao } from '@prisma/client';

import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';
import prisma from '../utils/prisma';

interface Similaridade {
  id: number;
  score: number;
}

class RecomendacaoRepository {
  async createRecomendacaoVagas(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    const vetorEmbeddingCandidato = await prisma.$queryRaw<Array<{ embedding: string }>>`
      SELECT embedding::text 
      FROM "Candidato" 
      WHERE id = ${candidatoId}
    `;

    if (vetorEmbeddingCandidato.length === 0 || !vetorEmbeddingCandidato[0]?.embedding) {
      return [];
    }

    const candidatoEmbedding = vetorEmbeddingCandidato[0].embedding;

    const vagasRecomendadas = await this.calculaSimilaridade(
      candidatoEmbedding,
      'Vaga',
      Prisma.sql`(v."dataExpiracao" IS NULL OR TO_DATE(v."dataExpiracao", 'DD/MM/YYYY') >= CURRENT_DATE)`,
    );

    if (vagasRecomendadas.length === 0) return [];

    const resultadoFinal = await this.getVagasPayload(vagasRecomendadas, candidatoId);

    this.deletaRecomendacoesAntigas('candidatoId', candidatoId, 'VAGAS_PARA_CANDIDATO');

    const dadosParaSalvar = resultadoFinal.map(item => ({
      vagaId: item.vagaId,
      candidatoId: item.candidatoId,
      tipo: item.tipo,
      score: item.score!,
      descricao: item.descricao,
      updatedAt: item.updatedAt,
    }));

    if (dadosParaSalvar.length > 0) {
      this.salvaNovasRecomendacoes(dadosParaSalvar);
    }

    return resultadoFinal;
  }

  async getVagasPayload(vagasRecomendadas: Similaridade[], candidatoId: number) {
    const vagasCompletas = await prisma.vaga.findMany({
      where: {
        id: { in: vagasRecomendadas.map(v => v.id) },
      },
      include: { recrutador: { include: { perfil: true } } },
    });

    return vagasRecomendadas
      .map(vaga => {
        const dadosVaga = vagasCompletas.find(v => v.id === vaga.id);

        if (!dadosVaga) return null;

        return {
          vagaId: dadosVaga.id,
          candidatoId: candidatoId,
          updatedAt: new Date(),
          descricao: 'Compatibilidade via IA',
          tipo: 'VAGAS_PARA_CANDIDATO' as const,
          score: vaga.score,
          vaga: dadosVaga,
        } as RecomendacaoVagaResponse;
      })
      .filter((item): item is RecomendacaoVagaResponse => item !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  async createRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    const vetorEmbeddingVaga = await prisma.$queryRaw<Array<{ embedding: string }>>`
      SELECT embedding::text 
      FROM "Vaga" 
      WHERE id = ${vagaId}
    `;

    if (vetorEmbeddingVaga.length === 0 || !vetorEmbeddingVaga[0]?.embedding) {
      return [];
    }

    const vagaEmbedding = vetorEmbeddingVaga[0].embedding;

    const cadidatosParaVaga = await this.calculaSimilaridade(
      vagaEmbedding,
      'Candidato',
      Prisma.sql`c.disponivel = true`,
    );

    if (cadidatosParaVaga.length === 0) return [];

    const resultadoFinal = await this.getCandidatoPayload(cadidatosParaVaga, vagaId);

    this.deletaRecomendacoesAntigas('vagaId', vagaId, 'CANDIDATOS_PARA_VAGA');

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

    this.salvaNovasRecomendacoes(dadosParaSalvar);

    return resultadoFinal;
  }

  async getCandidatoPayload(candidatosRecomendados: Similaridade[], vagaId: number) {
    const candidatosCompletos = await prisma.candidato.findMany({
      where: {
        id: { in: candidatosRecomendados.map(c => c.id) },
      },
      include: {
        perfil: true,
        experiencias: true,
      },
    });

    return candidatosRecomendados
      .map(candidato => {
        const dadosCandidato = candidatosCompletos.find(c => c.id === candidato.id);
        if (!dadosCandidato) return null;

        return {
          vagaId: vagaId,
          candidatoId: dadosCandidato.id,
          updatedAt: new Date() as Date,
          tipo: 'CANDIDATOS_PARA_VAGA' as const,
          score: candidato.score,
          descricao: 'Compatibilidade via IA',
          candidato: dadosCandidato,
        } as RecomendacaoCandidatoResponse;
      })
      .filter((item): item is RecomendacaoCandidatoResponse => item !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  async calculaSimilaridade(
    embedding: string,
    tableName: 'Candidato' | 'Vaga',
    additionalFilter: Prisma.Sql = Prisma.sql`1=1`,
  ): Promise<Similaridade[]> {
    const vetorEmbedding = Prisma.sql`${embedding}::vector`;

    return prisma.$queryRaw<Similaridade[]>`
      SELECT 
        id,
        1 - (embedding <=> ${vetorEmbedding}) as score
      FROM ${Prisma.raw(`"${tableName}"`)}
      WHERE 
        embedding IS NOT NULL
        AND ${additionalFilter}
      ORDER BY 
        embedding <=> ${vetorEmbedding} ASC
      LIMIT 10;
    `;
  }

  async deletaRecomendacoesAntigas(entidade: 'vagaId' | 'candidatoId', id: number, tipo: TipoRecomendacao) {
    await prisma.recomendacao.deleteMany({
      where: {
        [entidade]: id,
        tipo: tipo,
      },
    });
  }

  async salvaNovasRecomendacoes(dados: Prisma.RecomendacaoCreateManyInput[]) {
    await prisma.recomendacao.createMany({
      data: dados,
    });
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
