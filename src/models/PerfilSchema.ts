import { z } from 'zod';

import { RecrutadorResponseSchema } from './RecrutadorSchema';

const TipoPerfilEnum = z.enum(['CANDIDATO', 'RECRUTADOR']);

export const PerfilCreateSchema = z.object({
  nome: z.string(),
  email: z.email(),
  senha: z.string().min(8),
  tipo: TipoPerfilEnum,
  foto: z.url().optional(),
  biografia: z.string().trim().min(1).max(255).optional(),
});

export const PerfilUpdateSchema = PerfilCreateSchema.omit({
  senha: true,
});

export const PerfilResponseSchema = z.object({
  id: z.number(),
  tipo: TipoPerfilEnum,
  createdAt: z.date().or(z.iso.datetime()),
  updatedAt: z.date().or(z.iso.datetime()),
});

export const PerfilExtendedResponseSchema = PerfilResponseSchema.extend({
  recrutador: z
    .lazy(() => RecrutadorResponseSchema)
    .nullable()
    .optional(),
});

export type PerfilCreateDTO = z.infer<typeof PerfilCreateSchema>;
export type PerfilUpdateDTO = z.infer<typeof PerfilUpdateSchema>;
