import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';
import prisma from '../utils/prisma';

class RecomendacaoRepository {
  async createRecomendacaoVagas(candidatoId: number): Promise<RecomendacaoVagaResponse[]> {
    const candidato = await prisma.$queryRaw<Array<{ embedding: string }>>`
      SELECT embedding::text 
      FROM "Candidato" 
      WHERE id = ${candidatoId}
    `;

    if (candidato.length === 0 || !candidato[0]?.embedding) {
      return [];
    }

    const vetorCandidato = candidato[0].embedding;

    const vagasRaw = await prisma.$queryRaw<{ id: number; score: number }[]>`
      SELECT 
        v.id,
        1 - (v.embedding <=> ${vetorCandidato}::vector) as score
      FROM "Vaga" v
      WHERE 
        v.embedding IS NOT NULL
        AND (v."dataExpiracao" IS NULL OR TO_DATE(v."dataExpiracao", 'DD/MM/YYYY') >= CURRENT_DATE) 
      ORDER BY 
        v.embedding <=> ${vetorCandidato}::vector ASC
      LIMIT 10;
    `;

    if (vagasRaw.length === 0) return [];

    const vagasCompletas = await prisma.vaga.findMany({
      where: {
        id: { in: vagasRaw.map(v => v.id) },
      },
      include: { recrutador: { include: { perfil: true } } },
    });

    const resultadoFinal = vagasRaw
      .map(raw => {
        const dadosVaga = vagasCompletas.find(v => v.id === raw.id);

        if (!dadosVaga) return null;

        return {
          vagaId: dadosVaga.id,
          candidatoId: candidatoId,
          updatedAt: new Date(),
          descricao: 'Compatibilidade via IA',
          tipo: 'VAGAS_PARA_CANDIDATO' as const,
          score: raw.score,
          vaga: dadosVaga,
        } as RecomendacaoVagaResponse;
      })
      .filter((item): item is RecomendacaoVagaResponse => item !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    await prisma.$transaction(async tx => {
      await tx.recomendacao.deleteMany({
        where: {
          candidatoId: candidatoId,
          tipo: 'VAGAS_PARA_CANDIDATO',
        },
      });

      const dadosParaSalvar = resultadoFinal.map(item => ({
        vagaId: item.vagaId,
        candidatoId: item.candidatoId,
        tipo: item.tipo,
        score: item.score!,
        descricao: item.descricao,
        updatedAt: item.updatedAt,
      }));

      if (dadosParaSalvar.length > 0) {
        await tx.recomendacao.createMany({
          data: dadosParaSalvar,
        });
      }
    });

    return resultadoFinal;
  }

  async createRecomendacaoCandidatos(vagaId: number): Promise<RecomendacaoCandidatoResponse[]> {
    const vaga = await prisma.$queryRaw<Array<{ embedding: string }>>`
      SELECT embedding::text 
      FROM "Vaga" 
      WHERE id = ${vagaId}
    `;

    if (vaga.length === 0 || !vaga[0]?.embedding) {
      return [];
    }

    const vetorVaga = vaga[0].embedding;

    const candidatosRaw = await prisma.$queryRaw<{ id: number; score: number }[]>`
      SELECT 
        c.id,
        1 - (c.embedding <=> ${vetorVaga}::vector) as score
      FROM "Candidato" c
      WHERE 
        c.disponivel = true 
        AND c.embedding IS NOT NULL
      ORDER BY 
        c.embedding <=> ${vetorVaga}::vector ASC
      LIMIT 10;
    `;

    if (candidatosRaw.length === 0) return [];

    const candidatosCompletos = await prisma.candidato.findMany({
      where: {
        id: { in: candidatosRaw.map(c => c.id) },
      },
      include: {
        perfil: true,
        experiencias: true,
      },
    });

    const resultadoFinal = candidatosRaw
      .map(raw => {
        const dadosCandidato = candidatosCompletos.find(c => c.id === raw.id);
        if (!dadosCandidato) return null;

        return {
          vagaId: vagaId,
          candidatoId: dadosCandidato.id,
          updatedAt: new Date() as Date,
          tipo: 'CANDIDATOS_PARA_VAGA' as const,
          score: raw.score,
          descricao: 'Compatibilidade via IA',
          candidato: dadosCandidato,
        } as RecomendacaoCandidatoResponse;
      })
      .filter((item): item is RecomendacaoCandidatoResponse => item !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    await prisma.$transaction(async tx => {
      await tx.recomendacao.deleteMany({
        where: {
          vagaId: vagaId,
          tipo: 'CANDIDATOS_PARA_VAGA',
        },
      });

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

      await tx.recomendacao.createMany({
        data: dadosParaSalvar,
      });
    });

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
