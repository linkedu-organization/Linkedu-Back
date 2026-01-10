import { TipoPerfil } from '@prisma/client';

import { RecrutadorCreateDTO, RecrutadorUpdateDTO } from '../models/RecrutadorSchema';
import { perfilRepository } from '../repositories/PerfilRepositoy';
import prisma from '../utils/prisma';

class RecrutadorRepository {
  async create(data: RecrutadorCreateDTO) {
    const { perfil, ...recrutador } = data;
    return prisma.$transaction(async tx => {
      const perfilCriado = await perfilRepository.create(tx, perfil, TipoPerfil.RECRUTADOR);
      const recrutadorCriado = await tx.recrutador.create({
        data: { ...recrutador, perfil: { connect: { id: perfilCriado.id } } },
      });
      return { ...recrutadorCriado, perfil: perfilCriado };
    });
  }

  async getById(id: number) {
    return prisma.recrutador.findUnique({
      where: { id },
      include: { perfil: true },
    });
  }

  async getAll() {
    return prisma.recrutador.findMany({
      include: { perfil: true },
    });
  }

  async update(id: number, data: RecrutadorUpdateDTO) {
    const { perfil, ...recrutador } = data;
    return prisma.recrutador.update({
      where: { id },
      data: {
        ...recrutador,
        ...{ perfil: { update: perfil } },
      },
    });
  }

  async delete(id: number) {
    return prisma.recrutador.delete({
      where: { id },
    });
  }
}

export const recrutadorRepository = new RecrutadorRepository();
