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
      throw new Error(`Entidade de id: ${id} não encontrada!`);
    }
    return RecrutadorResponseSchema.parseAsync(result);
  }
}

export const recrutadorService = new RecrutadorService();
