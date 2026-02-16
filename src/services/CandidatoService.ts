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
import { Filter, Sorter } from '../utils/filterUtils';
import { limpaTexto, criarEmbedding } from '../utils/matchUtils';

class CandidatoService {
  async create(data: CandidatoCreateDTO) {
    await perfilService.validarEmail(data.perfil.email);
    const parsedData = CandidatoCreateSchema.parse(data);
    const hashSenha = await gerarHashSenha(parsedData.perfil.senha);
    const embedding = await this.gerarEmbedding(parsedData);
    const result = await candidatoRepository.create({
      ...parsedData,
      perfil: { ...parsedData.perfil, senha: hashSenha },
      embedding,
    });
    return CandidatoResponseSchema.parseAsync(result);
  }

  async getById(id: number) {
    const result = await this.findOrThrow(id);
    return CandidatoResponseSchema.parseAsync(result);
  }

  async getAll(data: { filters: Filter[]; sorters: Sorter[] }) {
    const result = await candidatoRepository.getAll(data);
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

  private async gerarEmbedding(candidato: CandidatoCreateDTO): Promise<number[]> {
    const {
      instituicao,
      areaAtuacao,
      nivelEscolaridade,
      periodoConclusao,
      tempoDisponivel,
      areasInteresse,
      habilidades,
    } = candidato;
    const textoEmbedding = `Profissional/Estudante da instituição ${instituicao} com foco em ${areaAtuacao}. 
    Nível de escolaridade: ${nivelEscolaridade}, com conclusão prevista para ${periodoConclusao ?? 'não informada'}. 
    Competências e conhecimentos técnicos: ${habilidades.join(', ')}. Áreas de interesse e objetivos: ${areasInteresse.join(', ')}. Disponibilidade de tempo: ${tempoDisponivel}.`;

    const embedding = await criarEmbedding(textoEmbedding);
    return embedding.values;
  }
}

export const candidatoService = new CandidatoService();
