import { GoogleGenerativeAI } from '@google/generative-ai';
import { Prisma, TipoRecomendacao } from '@prisma/client';

import prisma from './prisma';
import { VagaResponseDTO } from '../models/VagaSchema';
import { CandidatoExtendedResponseDTO } from '../models/CandidatoSchema';
import { RecomendacaoCandidatoResponse, RecomendacaoVagaResponse } from '../models/RecomendacaoSchema';

export interface Similaridade {
  id: number;
  score: number;
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function criarEmbedding(texto: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(texto);
  const embedding = result.embedding;
  return embedding;
}

export async function atualizarEmbedding(tableName: 'Vaga' | 'Candidato', tx: any, id: number, embedding: number[]) {
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

export async function gerarEmbeddingCandidato(tx: Prisma.TransactionClient, candidato: CandidatoExtendedResponseDTO) {
  const {
    instituicao,
    areaAtuacao,
    nivelEscolaridade,
    periodoConclusao,
    tempoDisponivel,
    areasInteresse,
    habilidades,
  } = candidato;

  const textoEmbedding = `Profissional/Estudante da instituição ${instituicao} com foco em ${areaAtuacao}. 
    Nível de escolaridade: ${nivelEscolaridade}, com conclusão prevista para ${periodoConclusao ?? 'não informada'}. 
    Competências e conhecimentos técnicos: ${habilidades.join(', ')}. Áreas de interesse e objetivos: ${areasInteresse.join(', ')}. Disponibilidade de tempo: ${tempoDisponivel}.`;

  const embedding = await criarEmbedding(textoEmbedding);
  await atualizarEmbedding('Candidato', tx, candidato.id, embedding.values);
}

export async function gerarEmbeddingVaga(tx: Prisma.TransactionClient, vaga: VagaResponseDTO) {
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
  } = vaga;

  const textoEmbedding = `Oportunidade de ${titulo} na instituição ${instituicao}. Perfil da Vaga: ${descricao}. Formação requerida: ${curso} para o público ${publicoAlvo}. 
    Requisitos técnicos mandatórios: ${conhecimentosObrigatorios}. Desejável e diferenciais: ${conhecimentosOpcionais}. Condições: Carga horária de ${cargaHoraria} e duração de ${duracao}.`;

  const embedding = await criarEmbedding(textoEmbedding);
  await atualizarEmbedding('Vaga', tx, vaga.id, embedding.values);
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
) {
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

  const resultado = await Promise.all(
    vagasRecomendadas.map(async vaga => {
      const dadosVaga = vagasCompletas.find(v => v.id === vaga.id);

      if (!dadosVaga) return null;
      const descricao = await geraDescricao(vaga.id, candidatoId, vaga.score);
      return {
        vagaId: dadosVaga.id,
        candidatoId: candidatoId,
        updatedAt: new Date(),
        tipo: 'VAGAS_PARA_CANDIDATO' as const,
        score: vaga.score,
        descricao: descricao,
        vaga: dadosVaga,
      } as RecomendacaoVagaResponse;
    }),
  );

  return resultado
    .filter((item): item is RecomendacaoVagaResponse => item !== null)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

export async function getCandidatosPayload(candidatosRecomendados: Similaridade[], vagaId: number) {
  const candidatosCompletos = await prisma.candidato.findMany({
    where: {
      id: { in: candidatosRecomendados.map(c => c.id) },
    },
    include: {
      perfil: true,
      experiencias: true,
    },
  });

  const resultado = await Promise.all(
    candidatosRecomendados.map(async candidato => {
      const dadosCandidato = candidatosCompletos.find(c => c.id === candidato.id);
      if (!dadosCandidato) return null;

      const descricao = await geraDescricao(dadosCandidato.id, vagaId, candidato.score);
      return {
        vagaId: vagaId,
        candidatoId: dadosCandidato.id,
        updatedAt: new Date() as Date,
        tipo: 'CANDIDATOS_PARA_VAGA' as const,
        score: candidato.score,
        descricao: descricao,
        candidato: dadosCandidato,
      } as RecomendacaoCandidatoResponse;
    }),
  );

  return resultado
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

export async function geraDescricao(vagaId: number, candidatoId: number, score: number): Promise<string> {
  const vaga = await prisma.vaga.findUnique({
    where: { id: vagaId },
  });

  const candidato = await prisma.candidato.findUnique({
    where: { id: candidatoId },
  });

  const textoEmbeddingCandidato = `Profissional/Estudante da instituição ${candidato?.instituicao} com foco em ${candidato?.areaAtuacao}. 
    Nível de escolaridade: ${candidato?.nivelEscolaridade}, com conclusão prevista para ${candidato?.periodoConclusao ?? 'não informada'}. 
    Competências e conhecimentos técnicos: ${candidato?.habilidades.join(', ')}. Áreas de interesse e objetivos: ${candidato?.areasInteresse.join(', ')}. Disponibilidade de tempo: ${candidato?.tempoDisponivel}.`;

  const textoEmbeddingVaga = `Oportunidade de ${vaga?.titulo} na instituição ${vaga?.instituicao}. Perfil da Vaga: ${vaga?.descricao}. Formação requerida: ${vaga?.curso} para o público ${vaga?.publicoAlvo}. 
        Requisitos técnicos mandatórios: ${vaga?.conhecimentosObrigatorios}. Desejável e diferenciais: ${vaga?.conhecimentosOpcionais}. Condições: Carga horária de ${vaga?.cargaHoraria} e duração de ${vaga?.duracao}.`;

  const prompt = `Gere uma descrição de recomendação com os motivos do match entre um candidato e uma vaga com base nas seguintes informações:
    Candidato: ${textoEmbeddingCandidato}
    Vaga: ${textoEmbeddingVaga}
    Score da recomendação: ${score}
    
    Explique os principais pontos de compatibilidade técnica e de interesse.
    Não invente informações. Use no máximo 5 linhas e não fale sobre o score.
    `;

  const response = await model.generateContent(prompt);
  return response.response.text();
}
