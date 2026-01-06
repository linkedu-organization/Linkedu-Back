import { Prisma, TipoPerfil } from '@prisma/client';

import { PerfilCreateDTO } from '../models/PerfilSchema';

class PerfilRepository {
  async create(tx: Prisma.TransactionClient, data: PerfilCreateDTO, tipo: TipoPerfil) {
    return tx.perfil.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        tipo: tipo,
        foto: data.foto ?? null,
        biografia: data.biografia ?? null,
        ultimoAcesso: new Date(),
      },
    });
  }
}

export const perfilRepository = new PerfilRepository();
