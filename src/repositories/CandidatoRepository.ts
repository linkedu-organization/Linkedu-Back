import { TipoPerfil } from '@prisma/client';

import { CandidatoCreateDTO, CandidatoUpdateDTO } from '../models/CandidatoSchema';
import { perfilRepository } from './PerfilRepositoy';
import prisma from '../utils/prisma';
import { Filter, Sorter, buildWhereClause, buildOrderClause } from '../utils/filterUtils';

class CandidatoRepository {
  async create(data: CandidatoCreateDTO) {
    const { perfil, ...candidato } = data;
    return prisma.$transaction(async tx => {
      const perfilCriado = await perfilRepository.create(tx, perfil, TipoPerfil.CANDIDATO);
      const candidatoCriado = await tx.candidato.create({
        data: { ...candidato, perfil: { connect: { id: perfilCriado.id } } },
      });
      return { ...candidatoCriado, perfil: perfilCriado };
    });
  }

  async getById(id: number) {
    return prisma.candidato.findUnique({
      where: { id },
      include: { perfil: true, experiencias: true },
    });
  }

  async getAll(data: { filters: Filter[]; sorters: Sorter[] }) {
    return prisma.candidato.findMany({
      include: { perfil: true, experiencias: true },
      where: buildWhereClause(data.filters),
      orderBy: buildOrderClause(data.sorters),
    });
  }

  async update(id: number, data: CandidatoUpdateDTO) {
    const { perfil, ...candidato } = data;
    return prisma.candidato.update({
      where: { id },
      data: {
        ...candidato,
        ...{ perfil: { update: perfil } },
      },
      include: { perfil: true, experiencias: true },
    });
  }

  async delete(id: number) {
    return prisma.$transaction(async tx => {
      const candidato = await tx.candidato.delete({
        where: { id },
      });
      await perfilRepository.delete(tx, candidato.perfilId);
      return candidato;
    });
  }
}

export const candidatoRepository = new CandidatoRepository();
