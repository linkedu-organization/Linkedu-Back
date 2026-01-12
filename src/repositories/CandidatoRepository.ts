import { TipoPerfil } from '@prisma/client';

import { CandidatoCreateDTO, CandidatoUpdateDTO } from '../models/CandidatoSchema';
import { perfilRepository } from './PerfilRepositoy';
import prisma from '../utils/prisma';

class CandidatoRepository {
  async create(data: CandidatoCreateDTO) {
    const { perfil, ...candidato } = data;
    return prisma.$transaction(async tx => {
      const perfilCriado = await perfilRepository.create(tx, perfil, TipoPerfil.RECRUTADOR);
      const candidatoCriado = await tx.candidato.create({
        data: { ...candidato, perfil: { connect: { id: perfilCriado.id } } },
      });
      return { ...candidatoCriado, perfil: perfilCriado };
    });
  }

  async getById(id: number) {
    return prisma.candidato.findUnique({
      where: { id },
      include: { perfil: true },
    });
  }

  async getAll() {
    return prisma.candidato.findMany({
      include: { perfil: true },
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
      include: { perfil: true },
    });
  }

  async delete(id: number) {
    return prisma.$transaction(async tx => {
      const candidato = await tx.candidato.delete({
        where: { id },
      });
      await perfilRepository.delete(tx, candidato.perfil_id);
      return candidato;
    });
  }
}

export const candidatoRepository = new CandidatoRepository();
