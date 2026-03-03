import { z } from 'zod';

import { CandidatoExtendedResponseSchema } from './CandidatoSchema';
import { VagaResponseSchema } from './VagaSchema';

const TipoRecomendacao = z.enum(['VAGAS_PARA_CANDIDATO', 'CANDIDATOS_PARA_VAGA']);

export const RecomendacaoCreateSchema = z.object({
  vagaId: z.number(),
  candidatoId: z.number(),
  updatedAt: z.date().or(z.iso.datetime()),
  score: z.number(),
  descricao: z.string(),
  tipo: TipoRecomendacao,
});

export const RecomendacaoCandidatoResponseSchema = RecomendacaoCreateSchema.extend({
  candidato: CandidatoExtendedResponseSchema,
});

export const RecomendacaoVagaResponseSchema = RecomendacaoCreateSchema.extend({
  vaga: VagaResponseSchema,
});

export type TipoRecomendacao = z.infer<typeof TipoRecomendacao>;
export type RecomendacaoCandidatoResponse = z.infer<typeof RecomendacaoCandidatoResponseSchema>;
export type RecomendacaoVagaResponse = z.infer<typeof RecomendacaoVagaResponseSchema>;
