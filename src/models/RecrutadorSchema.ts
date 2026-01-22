import { z } from 'zod';

import { VagaResponseSchema } from './VagaSchema';
import { PerfilCreateSchema, PerfilResponseSchema, PerfilUpdateSchema } from './PerfilSchema';

const CargoRecrutador = z.enum(['PROFESSOR', 'PESQUISADOR', 'TECNICO']);

const RecrutadorSchema = z.object({
  cargo: CargoRecrutador,
  instituicao: z.string(),
  areaAtuacao: z.string(),
  laboratorios: z.string().nullable(),
});

export const RecrutadorCreateSchema = RecrutadorSchema.extend({
  perfil: z.lazy(() => PerfilCreateSchema),
});

export const RecrutadorUpdateSchema = RecrutadorSchema.extend({
  perfil: z.lazy(() => PerfilUpdateSchema),
});

export const RecrutadorResponseSchema = RecrutadorSchema.extend({
  id: z.number(),
  perfil: z.lazy(() => PerfilResponseSchema),
  vagas: z.lazy(() => VagaResponseSchema.array()).optional(),
});

export type RecrutadorCreateDTO = z.infer<typeof RecrutadorCreateSchema>;
export type RecrutadorUpdateDTO = z.infer<typeof RecrutadorUpdateSchema>;
