import { z } from 'zod';

import { RecrutadorResponseSchema } from './RecrutadorSchema';
import { CandidatoResponseSchema } from './CandidatoSchema';

const TipoPerfilEnum = z.enum(['CANDIDATO', 'RECRUTADOR']);

export const PerfilCreateSchema = z.object({
  nome: z.string(),
  email: z.email(),
  senha: z.string().min(8),
  foto: z.string().nullable(),
  biografia: z.string().max(255).nullable(),
});

export const PerfilUpdateSchema = PerfilCreateSchema.omit({
  senha: true,
});

export const PerfilUpdateSenhaSchema = z.object({
  senha: z.string().min(8),
  token: z.string(),
});

export const PerfilResponseSchema = PerfilUpdateSchema.extend({
  id: z.number(),
  tipo: TipoPerfilEnum,
  createdAt: z.date().or(z.iso.datetime()),
  updatedAt: z.date().or(z.iso.datetime()),
  ultimoAcesso: z.date().or(z.iso.datetime()),
});

export const PerfilExtendedResponseSchema = PerfilResponseSchema.extend({
  recrutador: z
    .lazy(() => RecrutadorResponseSchema)
    .nullable()
    .optional(),
  candidato: z
    .lazy(() => CandidatoResponseSchema)
    .nullable()
    .optional(),
});

export type PerfilCreateDTO = z.infer<typeof PerfilCreateSchema>;
export type PerfilUpdateDTO = z.infer<typeof PerfilUpdateSchema>;
export type PerfilUpdateSenhaDTO = z.infer<typeof PerfilUpdateSenhaSchema>;
