import { GoogleGenerativeAI } from '@google/generative-ai';

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function criarEmbedding(texto: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(texto);
  const embedding = result.embedding;
  return embedding;
}

export function limpaTexto(frase: string) {
  // lib para stopWords
  const wordExcludePtBr = ['por', 'favor', 'qual', 'valor'];
  return frase
    .trim()
    .toLowerCase()
    .replace(/\s\s+/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()@]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(' ')
    .filter(value => !wordExcludePtBr.includes(value))
    .join(' ');
}
