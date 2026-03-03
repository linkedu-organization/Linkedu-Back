import { z } from 'zod';

import { CandidatoExtendedResponseSchema } from './CandidatoSchema';
import { VagaResponseSchema } from './VagaSchema';

const tipoRecomendacao = z.enum(['VAGAS_PARA_CANDIDATO', 'CANDIDATOS_PARA_VAGA']);

export const RecomendacaoCreateSchema = z.object({
  vagaId: z.number(),
  candidatoId: z.number(),
  updatedAt: z.date().or(z.iso.datetime()),
  score: z.number(),
  descricao: z.string(),
  tipo: tipoRecomendacao,
});

export const RecomendacaoCandidatoResponse = RecomendacaoCreateSchema.extend({
  candidato: CandidatoExtendedResponseSchema,
});

export const RecomendacaoVagaResponse = RecomendacaoCreateSchema.extend({
  vaga: VagaResponseSchema,
});

export type tipoRecomendacao = z.infer<typeof tipoRecomendacao>;
export type RecomendacaoCreate = z.infer<typeof RecomendacaoCreateSchema>;
export type RecomendacaoVagaResponse = z.infer<typeof RecomendacaoVagaResponse>;
export type RecomendacaoCandidatoResponse = z.infer<typeof RecomendacaoCandidatoResponse>;
