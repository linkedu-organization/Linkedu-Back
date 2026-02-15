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

export const RecomendacaoCandidatoResponse = RecomendacaoSchema.extend({
  candidato: CandidatoResponseSchema,
});

export const RecomendacaoVagaResponse = RecomendacaoSchema.extend({
  vaga: VagaResponseSchema,
});

export type RecomendacaoCandidatoResponse = z.infer<typeof RecomendacaoCandidatoResponse>;
export type RecomendacaoVagaResponse = z.infer<typeof RecomendacaoVagaResponse>;
