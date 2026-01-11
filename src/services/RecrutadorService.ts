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

  private async normalizeCreate(data: RecrutadorCreateDTO) {
    const parsedData = RecrutadorCreateSchema.parse(data);
    const hashSenha = await gerarHashSenha(parsedData.perfil.senha);
    await perfilService.validarEmail(parsedData.perfil.email);
    return { ...parsedData, perfil: { ...parsedData.perfil, senha: hashSenha } };
  }

  private async normalizeUpdate(id: number, data: RecrutadorUpdateDTO) {
    const atual = await this.findOrThrow(id);
    if (atual.perfil.email !== data.perfil.email) {
      await perfilService.validarEmail(data.perfil.email);
    }
    return data;
  }

  async create(data: RecrutadorCreateDTO) {
    const normalized = await this.normalizeCreate(data);
    const result = await recrutadorRepository.create(normalized);
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
    const normalized = await this.normalizeUpdate(id, data);
    const result = await recrutadorRepository.update(id, normalized);
    return RecrutadorResponseSchema.parseAsync(result);
  }

  async delete(id: number) {
    await this.findOrThrow(id);
    await recrutadorRepository.delete(id);
  }
}

export const recrutadorService = new RecrutadorService();
