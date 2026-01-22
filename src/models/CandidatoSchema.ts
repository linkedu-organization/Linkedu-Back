import { z } from 'zod';

import { PerfilCreateSchema, PerfilResponseSchema, PerfilUpdateSchema } from './PerfilSchema';

const CargoCandidato = z.enum(['ALUNO', 'TECNICO']);
const NivelEscolaridade = z.enum([
  'FUNDAMENTAL_INCOMPLETO',
  'FUNDAMENTAL_COMPLETO',
  'MEDIO_INCOMPLETO',
  'MEDIO_COMPLETO',
  'SUPERIOR_INCOMPLETO',
  'SUPERIOR_COMPLETO',
  'POS_GRADUACAO',
]);

const CandidatoSchema = z.object({
  cargo: CargoCandidato,
  instituicao: z.string(),
  areaAtuacao: z.string(),
  nivelEscolaridade: NivelEscolaridade,
  periodoIngresso: z.string().nullable(),
  periodoConclusao: z.string().nullable(),
  disponivel: z.boolean(),
  tempoDisponivel: z.number(),
  lattes: z.string().nullable(),
  linkedin: z.string().nullable(),
  areasInteressse: z.string().array(),
  habilidades: z.string().array(),
});

export const CandidatoCreateSchema = CandidatoSchema.extend({
  perfil: z.lazy(() => PerfilCreateSchema),
});

export const CandidatoUpdateSchema = CandidatoSchema.extend({
  perfil: z.lazy(() => PerfilUpdateSchema),
});

export const CandidatoResponseSchema = CandidatoSchema.extend({
  id: z.number(),
  perfil: z.lazy(() => PerfilResponseSchema),
});

export type CandidatoCreateDTO = z.infer<typeof CandidatoCreateSchema>;
export type CandidatoUpdateDTO = z.infer<typeof CandidatoUpdateSchema>;
