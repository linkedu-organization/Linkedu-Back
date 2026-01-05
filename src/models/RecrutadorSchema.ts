import { z } from 'zod';

import { PerfilCreateSchema, PerfilResponseSchema } from './PerfilSchema';

const CargoRecrutador = z.enum(['PROFESSOR', 'PESQUISADOR', 'TECNICO']);

export const RecrutadorSchema = z.object({
  cargo: CargoRecrutador,
  instituicao: z.string(),
  areaAtuacao: z.string(),
  laboratorios: z.string(),
});

export const RecrutadorCreateSchema = RecrutadorSchema.extend({
  perfil: z.lazy(() => PerfilCreateSchema),
});

export const RecrutadorResponseSchema = RecrutadorSchema.extend({
  id: z.number(),
  perfil: z.lazy(() => PerfilResponseSchema),
});

export type RecrutadorCreateDTO = z.infer<typeof RecrutadorCreateSchema>;
export type RecrutadorUpdateDTO = z.infer<typeof RecrutadorSchema>;
