import { VagaCreateDTO, VagaUpdateDTO } from '../models/VagaSchema';
import prisma from '../utils/prisma';
import { Filter, Sorter, buildWhereClause, buildOrderClause } from '../utils/filterUtils';
import { camposVaga, createEmbedding, gerarEmbedding } from '../utils/matchUtils';
import { recomendacaoRepository } from './RecomendacaoRepository';

class VagaRepository {
  async create(data: VagaCreateDTO, recrutadorId: number, embedding: number[]) {
    return prisma.$transaction(async tx => {
      const vagaCriada = await tx.vaga.create({
        data: { ...data, recrutadorId },
        include: { recrutador: { include: { perfil: true } } },
      });

      await createEmbedding('Vaga', tx, vagaCriada.id, embedding);
      return vagaCriada;
    });
  }

  async getById(id: number) {
    return prisma.vaga.findUnique({
      where: { id },
      include: { recrutador: { include: { perfil: true } } },
    });
  }

  async getAll(data: { filters: Filter[]; sorters: Sorter[] }) {
    return prisma.vaga.findMany({
      include: { recrutador: { include: { perfil: true } } },
      where: buildWhereClause(data.filters),
      orderBy: buildOrderClause(data.sorters),
    });
  }

  async update(id: number, data: VagaUpdateDTO) {
    return prisma.$transaction(async tx => {
      const vagaAtualizada = await tx.vaga.update({
        where: { id },
        data: Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)),
        include: { recrutador: { include: { perfil: true } } },
      });

      const camposModificados = camposVaga.some(campo => data[campo as keyof typeof data] !== undefined);

      if (camposModificados) {
        const embedding = await gerarEmbedding(vagaAtualizada as VagaCreateDTO);
        await createEmbedding('Vaga', tx, vagaAtualizada.id, embedding);
      }

      return vagaAtualizada;
    });
  }

  async delete(id: number) {
    prisma.$transaction(async tx => {
      await recomendacaoRepository.deleteByVagaId(tx, id);
      return tx.vaga.delete({
        where: { id },
      });
    });
  }
}

export const vagaRepository = new VagaRepository();
