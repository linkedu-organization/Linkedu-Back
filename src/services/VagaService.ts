import {
  VagaCreateDTO,
  VagaCreateSchema,
  VagaResponseSchema,
  VagaUpdateDTO,
  VagaUpdateSchema,
} from '../models/VagaSchema';
import { EntityNotFoundError } from '../errors/EntityNotFoundException';
import { vagaRepository } from '../repositories/VagaRepository';
import { Filter, Sorter } from '../utils/filterUtils';

class VagaService {
  async create(data: VagaCreateDTO) {
    const parsedData = VagaCreateSchema.parse(data);
    // TODO: recuperar o recrutador logado
    const authTokenId = parsedData.recrutadorId;
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

  async update(id: number, data: VagaUpdateDTO) {
    await this.findOrThrow(id);
    const parsedData = VagaUpdateSchema.parse(data);
    const result = await vagaRepository.update(id, parsedData);
    return VagaResponseSchema.parseAsync(result);
  }

  async delete(id: number) {
    await this.findOrThrow(id);
    await vagaRepository.delete(id);
  }

  private async findOrThrow(id: number) {
    const result = await vagaRepository.getById(id);
    if (!result) throw new EntityNotFoundError(id);
    return result;
  }
}

export const vagaService = new VagaService();
