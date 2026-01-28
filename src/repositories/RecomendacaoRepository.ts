import { RecomendacaoCreateDTO } from '../models/RecomendacaoSchema';
import prisma from '../utils/prisma';

class RecomendacaoRepository {
  async create(data: RecomendacaoCreateDTO) {
    return prisma.$transaction(async tx => {
      const recomendacaoCriada = await tx.recomendacao.create({
        data,
      });
      return recomendacaoCriada;
    });
  }
}
