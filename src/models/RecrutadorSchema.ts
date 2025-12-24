import { z } from 'zod';

import { PerfilCreateSchema } from './PerfilSchema';

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
});

export type RecrutadorCreateDTO = z.infer<typeof RecrutadorCreateSchema>;
export type RecrutadorUpdateDTO = z.infer<typeof RecrutadorSchema>;
