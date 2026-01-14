import {
  CandidatoCreateDTO,
  CandidatoCreateSchema,
  CandidatoResponseSchema,
  CandidatoUpdateDTO,
  CandidatoUpdateSchema,
} from '../models/CandidatoSchema';
import { candidatoRepository } from '../repositories/CandidatoRepository';
import { EntityNotFoundError } from '../errors/EntityNotFoundException';
import { gerarHashSenha } from '../utils/authUtils';
import { perfilService } from './PerfilService';

class CandidatoService {
  async create(data: CandidatoCreateDTO) {
    await perfilService.validarEmail(data.perfil.email);
    const parsedData = CandidatoCreateSchema.parse(data);
    const hashSenha = await gerarHashSenha(parsedData.perfil.senha);
    const result = await candidatoRepository.create({
      ...parsedData,
      perfil: { ...parsedData.perfil, senha: hashSenha },
    });
    return CandidatoResponseSchema.parseAsync(result);
  }

  async getById(id: number) {
    const result = await this.findOrThrow(id);
    return CandidatoResponseSchema.parseAsync(result);
  }

  async getAll() {
    const result = await candidatoRepository.getAll();
    return CandidatoResponseSchema.array().parseAsync(result);
  }

  async update(id: number, data: CandidatoUpdateDTO) {
    const atual = await this.findOrThrow(id);
    const parsedData = CandidatoUpdateSchema.parse(data);
    if (atual.perfil.email !== parsedData.perfil.email) {
      await perfilService.validarEmail(parsedData.perfil.email);
    }
    const result = await candidatoRepository.update(id, parsedData);
    return CandidatoResponseSchema.parseAsync(result);
  }

  async delete(id: number) {
    await this.findOrThrow(id);
    await candidatoRepository.delete(id);
  }

  private async findOrThrow(id: number) {
    const result = await candidatoRepository.getById(id);
    if (!result) throw new EntityNotFoundError(id);
    return result;
  }
}

export const candidatoService = new CandidatoService();
