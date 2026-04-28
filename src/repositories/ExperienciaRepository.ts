import { ExperienciaCreateDTO, ExperienciaUpdateDTO } from '../models/ExperienciaSchema';
import { atualizaResumoCandidato } from '../utils/matchUtils';
import prisma from '../utils/prisma';

class ExperienciaRepository {
  async create(data: ExperienciaCreateDTO, candidatoId: number) {
    return prisma.$transaction(async tx => {
      const experienciaCriada = await tx.experiencia.create({
        data: { ...data, candidatoId },
      });
      await atualizaResumoCandidato(tx, candidatoId);
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
    return prisma.$transaction(async tx => {
      const experienciaAtualizada = await tx.experiencia.update({
        where: { id },
        data: Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)),
      });
      await atualizaResumoCandidato(tx, experienciaAtualizada.candidatoId);
      return experienciaAtualizada;
    });
  }

  async delete(id: number) {
    return prisma.$transaction(async tx => {
      const experienciaDeletada = await tx.experiencia.delete({
        where: { id },
      });
      await atualizaResumoCandidato(tx, experienciaDeletada.candidatoId);
      return experienciaDeletada;
    });
  }
}

export const experienciaRepository = new ExperienciaRepository();
