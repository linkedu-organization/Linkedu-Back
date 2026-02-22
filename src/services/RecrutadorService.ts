import {
  RecrutadorCreateDTO,
  RecrutadorCreateSchema,
  RecrutadorExtendedResponseSchema,
  RecrutadorUpdateDTO,
  RecrutadorUpdateSchema,
} from '../models/RecrutadorSchema';
import { recrutadorRepository } from '../repositories/RecrutadorRepository';
import { EntityNotFoundError } from '../errors/EntityNotFoundError';
import { ensureSelfTargetedAction, gerarHashSenha } from '../utils/authUtils';
import { perfilService } from './PerfilService';
import { Filter, Sorter } from '../utils/filterUtils';

class RecrutadorService {
  async create(data: RecrutadorCreateDTO) {
    await perfilService.validarEmail(data.perfil.email);
    const parsedData = RecrutadorCreateSchema.parse(data);
    const hashSenha = await gerarHashSenha(parsedData.perfil.senha);

    const result = await recrutadorRepository.create({
      ...parsedData,
      perfil: { ...parsedData.perfil, senha: hashSenha },
    });
    return RecrutadorExtendedResponseSchema.parseAsync(result);
  }

  async getById(id: number) {
    const result = await this.findOrThrow(id);
    return RecrutadorExtendedResponseSchema.parseAsync(result);
  }

  async getAll(data: { filters: Filter[]; sorters: Sorter[] }) {
    const result = await recrutadorRepository.getAll(data);
    return RecrutadorExtendedResponseSchema.array().parseAsync(result);
  }

  async update(id: number, data: RecrutadorUpdateDTO, authToken: unknown) {
    ensureSelfTargetedAction(id, authToken);

    const atual = await this.findOrThrow(id);
    const parsedData = RecrutadorUpdateSchema.parse(data);

    if (atual.perfil.email !== parsedData.perfil.email) {
      await perfilService.validarEmail(parsedData.perfil.email);
    }

    const result = await recrutadorRepository.update(id, parsedData);
    return RecrutadorExtendedResponseSchema.parseAsync(result);
  }

  async delete(id: number, authToken: unknown) {
    ensureSelfTargetedAction(id, authToken);

    await this.findOrThrow(id);
    await recrutadorRepository.delete(id);
  }

  private async findOrThrow(id: number) {
    const result = await recrutadorRepository.getById(id);
    if (!result) throw new EntityNotFoundError(id);
    return result;
  }
}

export const recrutadorService = new RecrutadorService();
