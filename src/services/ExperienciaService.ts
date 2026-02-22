import {
  ExperienciaCreateDTO,
  ExperienciaCreateSchema,
  ExperienciaResponseSchema,
  ExperienciaUpdateDTO,
  ExperienciaUpdateSchema,
} from '../models/ExperienciaSchema';
import { EntityNotFoundError } from '../errors/EntityNotFoundError';
import { experienciaRepository } from '../repositories/ExperienciaRepository';
import { ensureSelfTargetedAction, getAuthTokenId } from '../utils/authUtils';

class ExperienciaService {
  async create(data: ExperienciaCreateDTO, authToken: unknown) {
    const parsedData = ExperienciaCreateSchema.parse(data);
    const authTokenId = getAuthTokenId(authToken);

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

  async update(id: number, data: ExperienciaUpdateDTO, authToken: unknown) {
    const experiencia = await this.findOrThrow(id);
    const parsedData = ExperienciaUpdateSchema.parse(data);
    ensureSelfTargetedAction(experiencia.candidatoId, authToken);

    const result = await experienciaRepository.update(id, parsedData);
    return ExperienciaResponseSchema.parseAsync(result);
  }

  async delete(id: number, authToken: unknown) {
    const experiencia = await this.findOrThrow(id);
    ensureSelfTargetedAction(experiencia.candidatoId, authToken);

    await experienciaRepository.delete(id);
  }

  private async findOrThrow(id: number) {
    const result = await experienciaRepository.getById(id);
    if (!result) throw new EntityNotFoundError(id);
    return result;
  }
}

export const experienciaService = new ExperienciaService();
