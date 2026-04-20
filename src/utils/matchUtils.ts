import { GoogleGenerativeAI } from '@google/generative-ai';
import { Prisma } from '@prisma/client';

import prisma from './prisma';
import { VagaCreateDTO, VagaResponseDTO } from '../models/VagaSchema';
import { CandidatoExtendedResponseDTO } from '../models/CandidatoSchema';

export interface Similaridade {
  id: number;
  score: number;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
//const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
    Competências e conhecimentos técnicos: ${habilidades.join(', ')}. Áreas de interesse e objetivos: ${areasInteresse.join(', ')}.
    Disponibilidade de tempo: ${tempoDisponivel}.`;

  const embedding = await criarEmbedding(textoEmbedding);
  await atualizarEmbedding(tx, 'Candidato', candidato.id, embedding.values);
}

export async function gerarResumoVaga(vaga: VagaCreateDTO) {
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

  const resumo = `Oportunidade de ${titulo} na instituição ${instituicao}. Perfil da Vaga: ${descricao}.
    Formação requerida: ${curso} para o público ${publicoAlvo.join(', ')}. Requisitos técnicos mandatórios: ${conhecimentosObrigatorios.join(', ')}.
    Desejável e diferenciais: ${conhecimentosOpcionais.join(', ')}. Condições: Carga horária de ${cargaHoraria} e duração de ${duracao}.`;

  return resumo;
}

export async function gerarEmbeddingVaga(tx: Prisma.TransactionClient, vaga: VagaResponseDTO, textoEmbedding: string) {
  const embedding = await criarEmbedding(textoEmbedding);
  await atualizarEmbedding(tx, 'Vaga', vaga.id, embedding.values);
}

async function criarEmbedding(texto: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(texto);
  return result.embedding;
}

async function atualizarEmbedding(
  tx: Prisma.TransactionClient,
  entidade: 'Vaga' | 'Candidato',
  id: number,
  embedding: number[],
) {
  if (embedding && embedding.length > 0) {
    const vectorString = `[${embedding.map(Number).join(',')}]`;
    await tx.$executeRawUnsafe(`UPDATE "${entidade}" SET embedding = $1::vector WHERE id = $2`, vectorString, id);
  }
}

export async function getEmbedding(entidade: 'Vaga' | 'Candidato', id: number) {
  const tabela = Prisma.raw(`"${entidade}"`);

  const resultado = await prisma.$queryRaw<Array<{ embedding: string }>>`
    SELECT embedding::text
    FROM ${tabela}
    WHERE id = ${id}
  `;

  return resultado[0]?.embedding ?? '';
}

export async function calcularSimilaridade(
  entidade: 'Vaga' | 'Candidato',
  embedding: string,
  filtrosAdicionais: Prisma.Sql = Prisma.sql`1=1`,
  join: Prisma.Sql = Prisma.empty,
) {
  const vetorEmbedding = Prisma.sql`${embedding}::vector`;

  return prisma.$queryRaw<Similaridade[]>`
    SELECT 
      id,
      1 - (embedding <=> ${vetorEmbedding}) as score
    FROM ${Prisma.raw(`"${entidade}"`)}
    ${join}
    WHERE 
      embedding IS NOT NULL
      AND ${filtrosAdicionais}
      AND 1 - (embedding <=> ${vetorEmbedding}) >= 0.6
    ORDER BY 
      embedding <=> ${vetorEmbedding} ASC
    LIMIT 10;
  `;
}

export async function getRecomendacaoVagasPayload(vagasSimilares: Similaridade[], candidatoId: number) {
  const result = await Promise.all(
    vagasSimilares.map(async vaga => {
      //const descricao = await gerarDescricao(vaga.id, candidatoId, vaga.score);
      return {
        vagaId: vaga.id,
        candidatoId: candidatoId,
        updatedAt: new Date(),
        tipo: 'VAGAS_PARA_CANDIDATO' as const,
        score: vaga.score,
        descricao: '',
      };
    }),
  );
  return result.sort((a, b) => (b.score || 0) - (a.score || 0));
}

export async function getRecomendacaoCandidatosPayload(candidatosSimilares: Similaridade[], vagaId: number) {
  const result = await Promise.all(
    candidatosSimilares.map(async candidato => {
      //const descricao = await gerarDescricao(dadosCandidato.id, vagaId, candidato.score);
      return {
        vagaId: vagaId,
        candidatoId: candidato.id,
        updatedAt: new Date() as Date,
        tipo: 'CANDIDATOS_PARA_VAGA' as const,
        score: candidato.score,
        descricao: '',
      };
    }),
  );
  return result.sort((a, b) => (b.score || 0) - (a.score || 0));
}

// async function gerarDescricao(vagaId: number, candidatoId: number, score: number) {
//   const vaga = await vagaService.getById(vagaId);
//   const candidato = await candidatoService.getById(candidatoId);

//   const textoEmbeddingCandidato = `Profissional/Estudante da instituição ${candidato.instituicao} com foco em ${candidato.areaAtuacao}.
//     Nível de escolaridade: ${candidato.nivelEscolaridade}, com conclusão prevista para ${candidato.periodoConclusao ?? 'não informada'}.
//     Competências e conhecimentos técnicos: ${candidato.habilidades.join(', ')}. Áreas de interesse e objetivos: ${candidato.areasInteresse?.join(', ')}. Disponibilidade de tempo: ${candidato.tempoDisponivel}.`;

//   const textoEmbeddingVaga = `Oportunidade de ${vaga.titulo} na instituição ${vaga.instituicao}. Perfil da Vaga: ${vaga.descricao}. Formação requerida: ${vaga.curso} para o público ${vaga.publicoAlvo}.
//         Requisitos técnicos mandatórios: ${vaga.conhecimentosObrigatorios}. Desejável e diferenciais: ${vaga.conhecimentosOpcionais}. Condições: Carga horária de ${vaga.cargaHoraria} e duração de ${vaga.duracao}.`;

//   const prompt = `Gere uma descrição de recomendação com os motivos do match entre um candidato e uma vaga com base nas seguintes informações:
//     Candidato: ${textoEmbeddingCandidato}
//     Vaga: ${textoEmbeddingVaga}
//     Score da recomendação: ${score}

//     Explique os principais pontos de compatibilidade técnica e de interesse.
//     Não invente informações. Use no máximo 5 linhas e não fale sobre o score.
//     `;

//   const response = await model.generateContent(prompt);
//   return response.response.text();
// }
