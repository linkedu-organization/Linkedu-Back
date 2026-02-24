import { z } from 'zod';

import { CandidatoResponseSchema } from './CandidatoSchema';
import { VagaResponseSchema } from './VagaSchema';

const tipoRecomendacao = z.enum(['VAGAS_PARA_CANDIDATO', 'CANDIDATOS_PARA_VAGA']);

const RecomendacaoSchema = z.object({
  vagaId: z.number(),
  candidatoId: z.number(),
  updatedAt: z.date().or(z.iso.datetime()),
  score: z.number().nullable(),
  descricao: z.string(),
  tipo: tipoRecomendacao,
});

export const RecomendacaoCandidatoResponse = RecomendacaoSchema.extend({
  candidato: CandidatoResponseSchema,
});

export const RecomendacaoVagaResponse = RecomendacaoSchema.extend({
  vaga: VagaResponseSchema,
});

export type tipoRecomendacao = z.infer<typeof tipoRecomendacao>;
export type RecomendacaoCandidatoResponse = z.infer<typeof RecomendacaoCandidatoResponse>;
export type RecomendacaoVagaResponse = z.infer<typeof RecomendacaoVagaResponse>;
