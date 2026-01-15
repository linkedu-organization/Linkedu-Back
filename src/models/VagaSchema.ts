import { z } from 'zod';

const Visibilidade = z.enum(['PÚBLICA', 'PRIVADA']);
const TipoVaga = z.enum(['VOLUNTARIA', 'REMUNERADA']);
const PublicoAlvo = z.enum(['GRADUACAO', 'POS_GRADUACAO', 'TECNICO', 'PESQUISADOR']);

const Categoria = z.enum([
  'PESQUISA',
  'PESQUISA_E_DESENVOLVIMENTO',
  'PESQUISA_DESENVOLVIMENTO_E_INOVACAO',
  'ORGANIZACAO_DE_EVENTOS',
  'OUTROS',
]);

const VagaSchema = z.object({
  recrutadorId: z.number(),
  titulo: z.string(),
  descricao: z.string(),
  categoria: Categoria,
  ehPublica: z.boolean(),
  ehRemunerada: z.boolean(),
  dataExpiracao: z.string().nullable(),
  cargaHoraria: z.number().array(),
  duracao: z.string().nullable(),
  instituicao: z.string(),
  curso: z.string(),
  linkInscricao: z.string(),
  local: z.string(),
  publicoAlvo: PublicoAlvo,
  conhecimentosObrigatorios: z.string().array(),
  conhecimentosOpcionais: z.string().array().nullable(),
  visibilidade: Visibilidade,
  tipoVaga: TipoVaga,
});
