import { TipoPerfil } from '@prisma/client';

import { RecrutadorCreateDTO } from '../models/RecrutadorSchema';
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
}

export const recrutadorRepository = new RecrutadorRepository();
