import { Prisma, TipoPerfil } from '@prisma/client';

import { PerfilCreateDTO } from '../models/PerfilSchema';

class PerfilRepository {
  async create(tx: Prisma.TransactionClient, data: PerfilCreateDTO, tipo: TipoPerfil) {
    return tx.perfil.create({
      data: { ...data, tipo: tipo, ultimoAcesso: new Date() },
    });
  }

  async update(tx: Prisma.TransactionClient, id: number, tipo: TipoPerfil, data: Partial<PerfilCreateDTO>) {
    return tx.perfil.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }
}

export const perfilRepository = new PerfilRepository();
