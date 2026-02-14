import { TipoPerfil } from '@prisma/client';

import { RecrutadorCreateDTO, RecrutadorUpdateDTO } from '../models/RecrutadorSchema';
import { perfilRepository } from '../repositories/PerfilRepositoy';
import prisma from '../utils/prisma';
import { Filter, Sorter, buildWhereClause, buildOrderClause } from '../utils/filterUtils';

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

  async getAll(data: { filters: Filter[]; sorters: Sorter[] }) {
    return prisma.recrutador.findMany({
      include: { perfil: true },
      where: buildWhereClause(data.filters),
      orderBy: buildOrderClause(data.sorters),
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
      include: { perfil: true },
    });
  }

  async delete(id: number) {
    return prisma.$transaction(async tx => {
      const recrutador = await tx.recrutador.delete({
        where: { id },
      });
      await perfilRepository.delete(tx, recrutador.perfilId);
      return recrutador;
    });
  }
}

export const recrutadorRepository = new RecrutadorRepository();
