import {
  ExperienciaCreateDTO,
  ExperienciaCreateSchema,
  ExperienciaResponseSchema,
  ExperienciaUpdateDTO,
  ExperienciaUpdateSchema,
} from '../models/ExperienciaSchema';
import { EntityNotFoundError } from '../errors/EntityNotFoundException';
import { experienciaRepository } from '../repositories/ExperienciaRepository';

class ExperienciaService {
  async create(data: ExperienciaCreateDTO) {
    const parsedData = ExperienciaCreateSchema.parse(data);
    // TODO: recuperar o candidato logado
    const authTokenId = parsedData.candidatoId;
    const result = await experienciaRepository.create(parsedData, authTokenId);
    return ExperienciaResponseSchema.parseAsync(result);
  }

  async getById(id: number) {
    const result = await this.findOrThrow(id);
    return ExperienciaResponseSchema.parseAsync(result);
  }

  async getAll() {
    const result = await experienciaRepository.getAll();
    return ExperienciaResponseSchema.array().parseAsync(result);
  }

  async update(id: number, data: ExperienciaUpdateDTO) {
    await this.findOrThrow(id);
    const parsedData = ExperienciaUpdateSchema.parse(data);
    const result = await experienciaRepository.update(id, parsedData);
    return ExperienciaResponseSchema.parseAsync(result);
  }

  async delete(id: number) {
    await this.findOrThrow(id);
    await experienciaRepository.delete(id);
  }

  private async findOrThrow(id: number) {
    const result = await experienciaRepository.getById(id);
    if (!result) throw new EntityNotFoundError(id);
    return result;
  }
}

export const experienciaService = new ExperienciaService();
