import { GoogleGenerativeAI } from '@google/generative-ai';
import { Prisma, TipoRecomendacao } from '@prisma/client';

import { VagaCreateDTO } from '../models/VagaSchema';
import { CandidatoCreateDTO } from '../models/CandidatoSchema';
import prisma from './prisma';
import { RecomendacaoCandidatoResponse, RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';

interface Similaridade {
  id: number;
  score: number;
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function criarEmbedding(texto: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(texto);
  const embedding = result.embedding;
  return embedding;
}

export async function createEmbedding(tableName: 'Vaga' | 'Candidato', tx: any, id: number, embedding: number[]) {
  if (embedding && embedding.length > 0) {
    const vectorString = `[${embedding.map(Number).join(',')}]`;
    await tx.$executeRawUnsafe(`UPDATE "${tableName}" SET embedding = $1::vector WHERE id = $2`, vectorString, id);
  }
}

export const camposVaga = [
  'titulo',
  'descricao',
  'cargaHoraria',
  'duracao',
  'instituicao',
  'curso',
  'conhecimentosObrigatorios',
  'conhecimentosOpcionais',
  'publicoAlvo',
];

export const camposCandidato = [
  'instituicao',
  'areaAtuacao',
  'nivelEscolaridade',
  'periodoConclusao',
  'tempoDisponivel',
  'areasInteresse',
  'habilidades',
];

export async function gerarEmbedding(tableName: CandidatoCreateDTO | VagaCreateDTO): Promise<number[]> {
  let textoEmbedding = '';
  if (tableName as CandidatoCreateDTO) {
    const {
      instituicao,
      areaAtuacao,
      nivelEscolaridade,
      periodoConclusao,
      tempoDisponivel,
      areasInteresse,
      habilidades,
    } = tableName as CandidatoCreateDTO;
    textoEmbedding = `Profissional/Estudante da instituição ${instituicao} com foco em ${areaAtuacao}. 
    Nível de escolaridade: ${nivelEscolaridade}, com conclusão prevista para ${periodoConclusao ?? 'não informada'}. 
    Competências e conhecimentos técnicos: ${habilidades.join(', ')}. Áreas de interesse e objetivos: ${areasInteresse.join(', ')}. Disponibilidade de tempo: ${tempoDisponivel}.`;
  } else if (tableName as VagaCreateDTO) {
    const {
      titulo,
      descricao,
      cargaHoraria,
      duracao,
      instituicao,
      curso,
      publicoAlvo,
      conhecimentosObrigatorios,
      conhecimentosOpcionais,
    } = tableName as VagaCreateDTO;

    textoEmbedding = `Oportunidade de ${titulo} na instituição ${instituicao}. Perfil da Vaga: ${descricao}. Formação requerida: ${curso} para o público ${publicoAlvo}. 
        Requisitos técnicos mandatórios: ${conhecimentosObrigatorios}. Desejável e diferenciais: ${conhecimentosOpcionais}. Condições: Carga horária de ${cargaHoraria} e duração de ${duracao}.`;
  }

  const embedding = await criarEmbedding(textoEmbedding);
  return embedding.values;
}

export async function salvaNovasRecomendacoes(dados: Prisma.RecomendacaoCreateManyInput[]) {
  await prisma.recomendacao.createMany({
    data: dados,
    skipDuplicates: true,
  });
}

export async function calculaSimilaridade(
  embedding: string,
  nomeTabela: 'Candidato' | 'Vaga',
  filtrosAdicionais: Prisma.Sql = Prisma.sql`1=1`,
): Promise<Similaridade[]> {
  const vetorEmbedding = Prisma.sql`${embedding}::vector`;

  return prisma.$queryRaw<Similaridade[]>`
      SELECT 
        id,
        1 - (embedding <=> ${vetorEmbedding}) as score
      FROM ${Prisma.raw(`"${nomeTabela}"`)}
      WHERE 
        embedding IS NOT NULL
        AND ${filtrosAdicionais}
      ORDER BY 
        embedding <=> ${vetorEmbedding} ASC
      LIMIT 10;
    `;
}

export async function getVagasPayload(vagasRecomendadas: Similaridade[], candidatoId: number) {
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
        tipo: 'VAGAS_PARA_CANDIDATO' as const,
        score: vaga.score,
        vaga: dadosVaga,
      } as RecomendacaoVagaResponse;
    })
    .filter((item): item is RecomendacaoVagaResponse => item !== null)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

export async function getCandidatoPayload(candidatosRecomendados: Similaridade[], vagaId: number) {
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
        candidato: dadosCandidato,
      } as RecomendacaoCandidatoResponse;
    })
    .filter((item): item is RecomendacaoCandidatoResponse => item !== null)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

export async function deletaRecomendacoes(entidade: 'vagaId' | 'candidatoId', id: number, tipo: TipoRecomendacao) {
  await prisma.recomendacao.deleteMany({
    where: {
      [entidade]: id,
      tipo: tipo,
    },
  });
}

export async function getVectorEmbedding(entidade: 'Candidato' | 'Vaga', id: number): Promise<string> {
  const tabela = Prisma.raw(`"${entidade}"`);

  const resultado = await prisma.$queryRaw<Array<{ embedding: string }>>`
    SELECT embedding::text
    FROM ${tabela}
    WHERE id = ${id}
  `;

  return resultado[0]?.embedding ?? '';
}
