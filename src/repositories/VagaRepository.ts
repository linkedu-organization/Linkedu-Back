import { VagaCreateDTO, VagaUpdateDTO } from '../models/VagaSchema';
import prisma from '../utils/prisma';

class VagaRepository {
  async create(data: VagaCreateDTO, recrutadorId: number) {
    return prisma.$transaction(async tx => {
      const vagaCriada = await tx.vaga.create({
        data: { ...data, recrutador: { connect: { id: recrutadorId } } },
      });
      return vagaCriada;
    });
  }

  async getById(id: number) {
    return prisma.vaga.findUnique({
      where: { id },
    });
  }

  async getAll() {
    return prisma.vaga.findMany();
  }

  async update(id: number, data: VagaUpdateDTO) {
    return prisma.vaga.update({
      where: { id },
      data: Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)),
    });
  }

  async delete(id: number) {
    return prisma.vaga.delete({
      where: { id },
    });
  }
}

export const vagaRepository = new VagaRepository();
