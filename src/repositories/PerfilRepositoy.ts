import { Prisma, TipoPerfil } from '@prisma/client';

import { PerfilCreateDTO } from '../models/PerfilSchema';
import { gerarHashSenha } from '../utils/authUtils';

class PerfilRepository {
  async create(tx: Prisma.TransactionClient, data: PerfilCreateDTO, tipo: TipoPerfil) {
    const hashSenha = await gerarHashSenha(data.senha);
    return tx.perfil.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: hashSenha,
        tipo: tipo,
        foto: data.foto ?? null,
        biografia: data.biografia ?? null,
        ultimoAcesso: new Date(),
      },
    });
  }
}

export const perfilRepository = new PerfilRepository();
