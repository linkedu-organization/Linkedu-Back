import { GoogleGenerativeAI } from '@google/generative-ai';

import { VagaCreateDTO } from '../models/VagaSchema';
import { CandidatoCreateDTO } from '../models/CandidatoSchema';

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
