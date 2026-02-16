import { VagaCreateDTO, VagaUpdateDTO } from '../models/VagaSchema';
import prisma from '../utils/prisma';
import { Filter, Sorter, buildWhereClause, buildOrderClause } from '../utils/filterUtils';

class VagaRepository {
  async create(data: VagaCreateDTO, recrutadorId: number) {
    const { embedding, ...vagaData } = data;
    return prisma.$transaction(async tx => {
      const vagaCriada = await tx.vaga.create({
        data: { ...vagaData, recrutadorId },
        include: { recrutador: { include: { perfil: true } } },
      });

      if (embedding && embedding.length > 0) {
        const vectorString = `[${embedding.map(Number).join(',')}]`;
        await tx.$executeRawUnsafe(
          `UPDATE "Vaga" SET embedding = $1::vector WHERE id = $2`,
          vectorString,
          vagaCriada.id,
        );
      }
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
    return prisma.vaga.update({
      where: { id },
      data: Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)),
      include: { recrutador: { include: { perfil: true } } },
    });
  }

  async delete(id: number) {
    return prisma.vaga.delete({
      where: { id },
    });
  }
}

export const vagaRepository = new VagaRepository();
