import {
  RecrutadorCreateDTO,
  RecrutadorCreateSchema,
  RecrutadorResponseSchema,
  RecrutadorUpdateDTO,
} from '../models/RecrutadorSchema';
import { recrutadorRepository } from '../repositories/RecrutadorRepository';
import { EntityNotFoundError } from '../errors/EntityNotFoundException';
import { gerarHashSenha } from '../utils/authUtils';
import { perfilService } from './PerfilService';

class RecrutadorService {
  private async findOrThrow(id: number) {
    const result = await recrutadorRepository.getById(id);
    if (!result) throw new EntityNotFoundError(id);
    return result;
  }

  async create(data: RecrutadorCreateDTO) {
    await perfilService.validarEmail(data.perfil.email);
    const parsedData = RecrutadorCreateSchema.parse(data);
    const hashSenha = await gerarHashSenha(parsedData.perfil.senha);
    const result = await recrutadorRepository.create({
      ...parsedData,
      perfil: { ...parsedData.perfil, senha: hashSenha },
    });
    return RecrutadorResponseSchema.parseAsync(result);
  }

  async getById(id: number) {
    const result = await this.findOrThrow(id);
    return RecrutadorResponseSchema.parseAsync(result);
  }

  async getAll() {
    const result = await recrutadorRepository.getAll();
    return RecrutadorResponseSchema.array().parseAsync(result);
  }

  async update(id: number, data: RecrutadorUpdateDTO) {
    const atual = await this.findOrThrow(id);
    if (atual.perfil.email !== data.perfil.email) {
      await perfilService.validarEmail(data.perfil.email);
    }
    const result = await recrutadorRepository.update(id, data);
    return RecrutadorResponseSchema.parseAsync(result);
  }

  async delete(id: number) {
    await this.findOrThrow(id);
    await recrutadorRepository.delete(id);
  }
}

export const recrutadorService = new RecrutadorService();
