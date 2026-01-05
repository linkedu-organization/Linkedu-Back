import { RecrutadorCreateDTO, RecrutadorCreateSchema, RecrutadorResponseSchema } from '../models/RecrutadorSchema';
import { recrutadorRepository } from '../repositories/RecrutadorRepository';

class RecrutadorService {
  async create(data: RecrutadorCreateDTO) {
    const parsedData = RecrutadorCreateSchema.parse(data);
    // await perfilService.validarEmail(parsedData.perfil.email);
    const result = await recrutadorRepository.create(parsedData);
    return RecrutadorResponseSchema.parseAsync(result);
  }
}

export const recrutadorService = new RecrutadorService();
