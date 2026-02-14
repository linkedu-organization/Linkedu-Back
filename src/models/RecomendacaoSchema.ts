import { z } from 'zod';

import { CandidatoResponseSchema } from './CandidatoSchema';
import { VagaResponseSchema } from './VagaSchema';

const tipoRecomendacao = z.enum(['VAGAS_PARA_CANDIDATO', 'CANDIDATOS_PARA_VAGA']);

const RecomendacaoSchema = z.object({
  vagaId: z.number(),
  candidatoId: z.number(),
  updatedAt: z.date().or(z.iso.datetime()),
  descricao: z.string(),
  score: z.number().nullable(),
  tipo: tipoRecomendacao,
});

export const RecomendacaoResponseCandidatoSchema = RecomendacaoSchema.extend({
  candidato: CandidatoResponseSchema,
});

export const RecomendacaoResponseVagaSchema = RecomendacaoSchema.extend({
  vaga: VagaResponseSchema,
});

export type RecomendacaoResponseDTO = z.infer<typeof RecomendacaoResponseCandidatoSchema>;
export type RecomendacaoVagaResponseDTO = z.infer<typeof RecomendacaoResponseVagaSchema>;
