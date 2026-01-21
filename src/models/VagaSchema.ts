import { z } from 'zod';

const PublicoAlvo = z.enum(['GRADUACAO', 'POS_GRADUACAO', 'TECNICO', 'PESQUISADOR']);

const Categoria = z.enum([
  'PESQUISA',
  'PESQUISA_E_DESENVOLVIMENTO',
  'PESQUISA_DESENVOLVIMENTO_E_INOVACAO',
  'ORGANIZACAO_DE_EVENTOS',
  'EXTENSAO',
  'MONITORIA',
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
  cargaHoraria: z.number(),
  duracao: z.string().nullable(),
  instituicao: z.string(),
  curso: z.string(),
  linkInscricao: z.string(),
  local: z.string(),
  publicoAlvo: PublicoAlvo.array(),
  conhecimentosObrigatorios: z.string().array(),
  conhecimentosOpcionais: z.string().array(),
});

export const VagaCreateSchema = VagaSchema;

export const VagaUpdateSchema = VagaSchema.partial();

export const VagaResponseSchema = VagaSchema.extend({
  id: z.number(),
});

export type VagaCreateDTO = z.infer<typeof VagaCreateSchema>;
export type VagaUpdateDTO = z.infer<typeof VagaUpdateSchema>;
