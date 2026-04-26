import { Prisma, TipoPerfil } from '@prisma/client';

import prisma from '../utils/prisma';
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

  async delete(tx: Prisma.TransactionClient, id: number) {
    return tx.perfil.delete({
      where: { id },
    });
  }

  async getById(id: number) {
    return prisma.perfil.findUnique({
      where: { id },
      include: {
        recrutador: true,
        candidato: true,
      },
    });
  }

  async getByEmail(email: string) {
    return prisma.perfil.findFirst({
      where: { email },
      include: {
        recrutador: true,
        candidato: true,
      },
    });
  }

  async getByResetToken(token: string) {
    return await prisma.perfil.findFirst({
      where: {
        resetToken: token,
      },
    });
  }

  async salvarResetToken(email: string, token: string, expiresAt: Date) {
    const perfil = await this.getByEmail(email);
    await prisma.perfil.update({
      where: { id: perfil!.id },
      data: {
        resetToken: token,
        resetTokenExpiresAt: expiresAt,
      },
    });
  }

  async atualizarSenha(id: number, senha: string) {
    return prisma.perfil.update({
      where: { id },
      data: {
        senha,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });
  }
}

export const perfilRepository = new PerfilRepository();
