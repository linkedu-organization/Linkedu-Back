import { GoogleGenerativeAI } from '@google/generative-ai';
import { Prisma } from '@prisma/client';

import prisma from './prisma';
import { VagaResponseDTO } from '../models/VagaSchema';
import { CandidatoExtendedResponseDTO } from '../models/CandidatoSchema';
import { vagaService } from '../services/VagaService';
import { candidatoService } from '../services/CandidatoService';

export interface Similaridade {
  id: number;
  score: number;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

  const textoEmbedding = `Oportunidade de ${titulo} na instituição ${instituicao}. Perfil da Vaga: ${descricao}.
    Formação requerida: ${curso} para o público ${publicoAlvo.join(', ')}. Requisitos técnicos mandatórios: ${conhecimentosObrigatorios.join(', ')}.
    Desejável e diferenciais: ${conhecimentosOpcionais.join(', ')}. Condições: Carga horária de ${cargaHoraria} e duração de ${duracao}.`;

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
      const descricao = await gerarDescricaoRecomendacao(vaga.id, candidatoId, vaga.score);
      return {
        vagaId: vaga.id,
        candidatoId,
        updatedAt: new Date(),
        tipo: 'VAGAS_PARA_CANDIDATO' as const,
        score: vaga.score,
        descricao,
      };
    }),
  );
  return result.sort((a, b) => (b.score || 0) - (a.score || 0));
}

export async function getRecomendacaoCandidatosPayload(candidatosSimilares: Similaridade[], vagaId: number) {
  const result = await Promise.all(
    candidatosSimilares.map(async candidato => {
      const descricao = await gerarDescricaoRecomendacao(vagaId, candidato.id, candidato.score);
      return {
        vagaId,
        candidatoId: candidato.id,
        updatedAt: new Date() as Date,
        tipo: 'CANDIDATOS_PARA_VAGA' as const,
        score: candidato.score,
        descricao,
      };
    }),
  );
  return result.sort((a, b) => (b.score || 0) - (a.score || 0));
}

async function gerarDescricaoRecomendacao(vagaId: number, candidatoId: number, score: number) {
  const vaga = await vagaService.getById(vagaId);
  const candidato = await candidatoService.getById(candidatoId);

  const prompt = `Dado que o score do match foi ${score}, gere uma descrição que justifique o alinhamento entre o candidato e a vaga.
  Considere as seguintes comparações (com base em similaridade semântica):

  - Público-alvo da vaga: ${vaga.publicoAlvo} | Escolaridade do candidato: ${candidato.nivelEscolaridade}
  - Instituição da vaga: ${vaga.instituicao} | Instituição do candidato: ${candidato.instituicao}
  - Carga horária da vaga: ${vaga.cargaHoraria} | Tempo disponível do candidato: ${candidato.tempoDisponivel}
  - Duração da vaga: ${vaga.duracao} | Período de conclusão do candidato: ${candidato.periodoConclusao ?? 'não informada'}
  - Perfil e descrição da vaga: ${vaga.descricao} | Área de atuação do candidato: ${candidato.areaAtuacao}
  - Título da vaga: ${vaga.titulo}
  - Requisitos técnicos obrigatórios: ${vaga.conhecimentosObrigatorios} | Habilidades do candidato: ${candidato.habilidades.join(', ')}
  - Diferenciais da vaga: ${vaga.conhecimentosOpcionais} | Áreas de interesse do candidato: ${candidato.areasInteresse?.join(', ')}

  Instruções:
  - Destaque as principais similaridades entre candidato e vaga.
  - Utilize também o título e a descrição da vaga para identificar conexões adicionais.

  Restrições:
  - Produza um texto de 400 caracteres.
  - Não mencione o score.
  - Não inclua justificativas sobre falta de informação.
  - Mantenha um tom formal, mas não excessivamente erudito.
  - Caso haja incerteza, utilize uma justificativa genérica, porém coerente com os dados apresentados.`;

  const response = await model.generateContent(prompt);
  return response.response.text();
}
