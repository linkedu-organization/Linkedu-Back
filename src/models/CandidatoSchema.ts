import { z } from 'zod';

import { PerfilCreateSchema, PerfilResponseSchema } from './PerfilSchema';

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
const CargaHoraria = z.enum(['ATE_10H', 'DE_10_A_20H', 'DE_20_A_30H', 'ACIMA_DE_30H']);

const CandidatoSchema = z.object({
  cargo: CargoCandidato,
  instituicao: z.string(),
  areaAtuacao: z.string(),
  nivelEscolaridade: NivelEscolaridade,
  periodoIngresso: z.string().nullable(),
  periodoConclusao: z.string().nullable(),
  disponivel: z.boolean(),
  tempoDisponivel: CargaHoraria,
  lattes: z.string().nullable(),
  linkedin: z.string().nullable(),
  areasInteressse: z.string().array(),
  habilidades: z.string().array(),
});

export const CandidatoCreateSchema = CandidatoSchema.extend({
  perfil: z.lazy(() => PerfilCreateSchema),
});

export const CandidatoResponseSchema = CandidatoSchema.extend({
  id: z.number(),
  perfil: z.lazy(() => PerfilResponseSchema),
});

export type CandidatoCreateDTO = z.infer<typeof CandidatoCreateSchema>;
export type CandidatoUpdateDTO = z.infer<typeof CandidatoCreateSchema>;
