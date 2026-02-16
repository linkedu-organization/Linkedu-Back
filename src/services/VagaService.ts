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
import { criarEmbedding } from '../utils/matchUtils';

class VagaService {
  async create(data: VagaCreateDTO) {
    const parsedData = VagaCreateSchema.parse(data);
    // TODO: recuperar o recrutador logado
    const authTokenId = parsedData.recrutadorId;
    const embedding = await this.gerarEmbedding(parsedData);
    const result = await vagaRepository.create({ ...parsedData, embedding }, authTokenId);
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

  private async gerarEmbedding(vaga: VagaCreateDTO): Promise<number[]> {
    const {
      titulo,
      descricao,
      cargaHoraria,
      duracao,
      instituicao,
      curso,
      publicoAlvo,
      conhecimentosObrigatorios,
      conhecimentosOpcionais,
    } = vaga;

    const textoEmbedding = `Oportunidade de ${titulo} na instituição ${instituicao}. Perfil da Vaga: ${descricao}. Formação requerida: ${curso} para o público ${publicoAlvo}. 
    Requisitos técnicos mandatórios: ${conhecimentosObrigatorios}. Desejável e diferenciais: ${conhecimentosOpcionais}. Condições: Carga horária de ${cargaHoraria} e duração de ${duracao}.`;

    const embedding = await criarEmbedding(textoEmbedding);
    return embedding.values;
  }
}

export const vagaService = new VagaService();
