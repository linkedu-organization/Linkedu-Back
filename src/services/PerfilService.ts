import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';

import { AppError } from '../errors/AppError';
import { perfilRepository } from '../repositories/PerfilRepositoy';
import { EntityNotFoundError } from '../errors/EntityNotFoundException';
import { gerarAuthToken } from '../utils/authUtils';
import { PerfilExtendedResponseSchema } from '../models/PerfilSchema';

class PerfilService {
  async validarEmail(email: string) {
    const emailAtivo = await perfilRepository.getByEmail(email);
    if (emailAtivo) {
      throw new AppError('Email já cadastrado', 409);
    }
  }

  async login(email: string, senha: string) {
    const perfil = await perfilRepository.getByEmail(email);
    if (!perfil) {
      throw new AppError('Email não cadastrado', 404);
    }

    const senhaValida = await bcrypt.compare(senha, perfil.senha);
    if (!senhaValida) {
      throw new AppError('Senha incorreta', 401);
    }

    return gerarAuthToken(perfil);
  }

  async getPerfilLogado(authToken: JwtPayload) {
    if (!authToken) {
      return { autenticado: false };
    }

    const perfil = await perfilRepository.getById(authToken.perfilId);
    if (!perfil) {
      throw new EntityNotFoundError(authToken.perfilId);
    }

    const parsedData = await PerfilExtendedResponseSchema.parseAsync(perfil);
    return { autenticado: true, perfil: parsedData };
  }
}

export const perfilService = new PerfilService();
