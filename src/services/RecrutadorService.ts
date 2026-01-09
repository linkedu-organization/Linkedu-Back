import { EntityNotFoundError } from '../errors/EntityNotFoundException';
import { RecrutadorCreateDTO, RecrutadorCreateSchema, RecrutadorResponseSchema } from '../models/RecrutadorSchema';
import { recrutadorRepository } from '../repositories/RecrutadorRepository';
import { gerarHashSenha } from '../utils/authUtils';

class RecrutadorService {
  async create(data: RecrutadorCreateDTO) {
    const parsedData = RecrutadorCreateSchema.parse(data);
    const hashSenha = await gerarHashSenha(parsedData.perfil.senha);
    // await perfilService.validarEmail(parsedData.perfil.email);
    const result = await recrutadorRepository.create({
      ...parsedData,
      perfil: { ...parsedData.perfil, senha: hashSenha },
    });
    return RecrutadorResponseSchema.parseAsync(result);
  }

  async getById(id: number) {
    const result = await recrutadorRepository.getById(id);
    if (!result) {
      throw new EntityNotFoundError(id);
    }
    return RecrutadorResponseSchema.parseAsync(result);
  }

  async getAll() {
    const result = await recrutadorRepository.getAll();
    return RecrutadorResponseSchema.array().parseAsync(result);
  }

  async delete(id: number) {
    const recrutador = await recrutadorRepository.getById(id);
    if (!recrutador) {
      throw new EntityNotFoundError(id);
    }
    await recrutadorRepository.delete(id);
  }
}

export const recrutadorService = new RecrutadorService();
