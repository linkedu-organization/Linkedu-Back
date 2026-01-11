import { AppError } from '../errors/AppError';
import { perfilRepository } from '../repositories/PerfilRepositoy';

class PerfilService {
  async validarEmail(email: string) {
    const emailAtivo = await perfilRepository.getByEmail(email);
    if (emailAtivo) {
      throw new AppError('Email já cadastrado', 409);
    }
  }
}

export const perfilService = new PerfilService();
