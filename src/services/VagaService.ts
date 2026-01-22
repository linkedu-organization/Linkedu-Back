import {
  VagaCreateDTO,
  VagaCreateSchema,
  VagaResponseSchema,
  VagaUpdateDTO,
  VagaUpdateSchema,
} from '../models/VagaSchema';
import { EntityNotFoundError } from '../errors/EntityNotFoundException';
import { vagaRepository } from '../repositories/VagaRepository';

class VagaService {
  async create(data: VagaCreateDTO) {
    const parsedData = VagaCreateSchema.parse(data);
    const result = await vagaRepository.create(parsedData);
    return VagaResponseSchema.parseAsync(result);
  }

  async getById(id: number) {
    const result = await this.findOrThrow(id);
    return VagaResponseSchema.parseAsync(result);
  }

  async getAll() {
    const result = await vagaRepository.getAll();
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
