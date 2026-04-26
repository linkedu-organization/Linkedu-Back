import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';

import { AppError } from '../errors/AppError';
import { perfilRepository } from '../repositories/PerfilRepositoy';
import { EntityNotFoundError } from '../errors/EntityNotFoundError';
import { gerarAuthToken, gerarHashSenha, gerarResetToken } from '../utils/authUtils';
import {
  PerfilExtendedResponseSchema,
  PerfilResponseSchema,
  PerfilUpdateSenhaDTO,
  PerfilUpdateSenhaSchema,
} from '../models/PerfilSchema';
import { EmailNotRegisteredError } from '../errors/EmailNotRegisteredError';
import { sendEmail } from '../utils/mailer';
import { InvalidTokenError } from '../errors/InvalidTokenError';

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
      throw new EmailNotRegisteredError();
    }

    const senhaValida = await bcrypt.compare(senha, perfil.senha);
    if (!senhaValida) {
      throw new AppError('Senha incorreta', 401);
    }

    return gerarAuthToken(perfil);
  }

  async getPerfilAutenticado(authToken: JwtPayload) {
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

  async recuperarSenha(email: string) {
    const emailAtivo = await perfilRepository.getByEmail(email);
    if (!emailAtivo) {
      throw new EmailNotRegisteredError();
    }

    const { token, expiresAt } = gerarResetToken();
    const resetLink = `${process.env.FRONTEND_URL}/recover/reset?token=${token}`;

    await sendEmail(email, 'Recuperação de Senha', 'template-email-recuperar-senha.html', { resetLink });
    await perfilRepository.salvarResetToken(email, token, expiresAt);
  }

  async atualizarSenha(data: PerfilUpdateSenhaDTO) {
    const parsedData = PerfilUpdateSenhaSchema.parse(data);
    const perfil = await perfilRepository.getByResetToken(parsedData.token);

    if (!perfil) {
      throw new InvalidTokenError();
    }

    if (perfil.resetTokenExpiresAt && perfil.resetTokenExpiresAt < new Date()) {
      throw new AppError('Token de recuperação expirado. Por favor, solicite um novo email de recuperação.', 401);
    }

    const hashSenha = await gerarHashSenha(parsedData.senha);
    const result = await perfilRepository.atualizarSenha(perfil.id, hashSenha);

    return PerfilResponseSchema.parseAsync(result);
  }
}

export const perfilService = new PerfilService();
