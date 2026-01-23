import { z } from 'zod';

import { RecrutadorResponseSchema } from './RecrutadorSchema';

const PublicoAlvo = z.enum(['ALUNO_GRADUACAO', 'ALUNO_POS_GRADUACAO', 'TECNICO', 'PESQUISADOR']);

const Categoria = z.enum([
  'PROJETO_PESQUISA',
  'PROJETO_PESQUISA_DESENVOLVIMENTO',
  'PROJETO_PESQUISA_DESENVOLVIMENTO_INOVACAO',
  'PROJETO_EXTENSAO',
  'MONITORIA',
  'ORGANIZACAO_EVENTO',
  'OUTROS',
]);

const VagaSchema = z.object({
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
  recrutador: RecrutadorResponseSchema,
});

export type VagaCreateDTO = z.infer<typeof VagaCreateSchema>;
export type VagaUpdateDTO = z.infer<typeof VagaUpdateSchema>;
