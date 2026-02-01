import { ExperienciaCreateDTO, ExperienciaUpdateDTO } from '../models/ExperienciaSchema';
import prisma from '../utils/prisma';

class ExperienciaRepository {
  async create(data: ExperienciaCreateDTO, candidatoId: number) {
    return prisma.$transaction(async tx => {
      const experienciaCriada = await tx.experiencia.create({
        data: { ...data, candidatoId },
      });
      return experienciaCriada;
    });
  }

  async getById(id: number) {
    return prisma.experiencia.findUnique({
      where: { id },
    });
  }

  async getAll() {
    return prisma.experiencia.findMany();
  }

  async update(id: number, data: ExperienciaUpdateDTO) {
    return prisma.experiencia.update({
      where: { id },
      data: Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)),
    });
  }

  async delete(id: number) {
    return prisma.experiencia.delete({
      where: { id },
    });
  }
}

export const experienciaRepository = new ExperienciaRepository();
