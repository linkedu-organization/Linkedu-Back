import { z } from 'zod';

const ExperienciaSchema = z.object({
  titulo: z.string(),
  descricao: z.string(),
  orientador: z.string(),
  instituicao: z.string(),
  periodoInicio: z.string(),
  periodoFim: z.string().nullable(),
  local: z.string().nullable(),
});

export const ExperienciaCreateSchema = ExperienciaSchema.extend({
  candidatoId: z.number(),
});

export const ExperienciaUpdateSchema = ExperienciaSchema.partial();

export const ExperienciaResponseSchema = ExperienciaSchema.extend({
  id: z.number(),
});

export type ExperienciaCreateDTO = z.infer<typeof ExperienciaCreateSchema>;
export type ExperienciaUpdateDTO = z.infer<typeof ExperienciaUpdateSchema>;
