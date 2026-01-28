import { z } from 'zod';

const tipoRecomendacao = z.enum(['VAGAS_PARA_CANDIDATO', 'CANDIDATOS_PARA_VAGA']);

const RecomendacaoSchema = z.object({
  vagaId: z.number(),
  candidatoId: z.number(),
  updatedAt: z.date().or(z.iso.datetime()),
  descricao: z.string(),
  tipo: tipoRecomendacao,
});

export const RecomendacaoCreateSchema = RecomendacaoSchema;

export const RecomendacaoResponseSchema = RecomendacaoSchema.extend({
  id: z.number(),
});

export type RecomendacaoCreateDTO = z.infer<typeof RecomendacaoCreateSchema>;
export type RecomendacaoResponseDTO = z.infer<typeof RecomendacaoResponseSchema>;
