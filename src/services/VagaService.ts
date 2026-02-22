import {
  VagaCreateDTO,
  VagaCreateSchema,
  VagaResponseSchema,
  VagaUpdateDTO,
  VagaUpdateSchema,
} from '../models/VagaSchema';
import { EntityNotFoundError } from '../errors/EntityNotFoundError';
import { vagaRepository } from '../repositories/VagaRepository';
import { Filter, Sorter } from '../utils/filterUtils';
import { ensureSelfTargetedAction, getAuthTokenId } from '../utils/authUtils';

class VagaService {
  async create(data: VagaCreateDTO, authToken: unknown) {
    const parsedData = VagaCreateSchema.parse(data);
    const authTokenId = getAuthTokenId(authToken);

    const result = await vagaRepository.create(parsedData, authTokenId);
    return VagaResponseSchema.parseAsync(result);
  }

  async getById(id: number) {
    const result = await this.findOrThrow(id);
    return VagaResponseSchema.parseAsync(result);
  }

  async getAll(data: { filters: Filter[]; sorters: Sorter[] }) {
    const result = await vagaRepository.getAll(data);
    return VagaResponseSchema.array().parseAsync(result);
  }

  async update(id: number, data: VagaUpdateDTO, authToken: unknown) {
    const vaga = await this.findOrThrow(id);
    const parsedData = VagaUpdateSchema.parse(data);
    ensureSelfTargetedAction(vaga.recrutador.id, authToken);

    const result = await vagaRepository.update(id, parsedData);
    return VagaResponseSchema.parseAsync(result);
  }

  async delete(id: number, authToken: unknown) {
    const vaga = await this.findOrThrow(id);
    ensureSelfTargetedAction(vaga.recrutador.id, authToken);

    await vagaRepository.delete(id);
  }

  private async findOrThrow(id: number) {
    const result = await vagaRepository.getById(id);
    if (!result) throw new EntityNotFoundError(id);
    return result;
  }
}

export const vagaService = new VagaService();
