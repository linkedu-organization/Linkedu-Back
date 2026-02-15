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

class CandidatoService {
  async create(data: CandidatoCreateDTO) {
    await perfilService.validarEmail(data.perfil.email);
    const parsedData = CandidatoCreateSchema.parse(data);
    const hashSenha = await gerarHashSenha(parsedData.perfil.senha);
    const embedding = this.gerarEmbedding(parsedData);
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

  private gerarEmbedding(candidato: CandidatoCreateDTO): string[] {
    const {
      areaAtuacao,
      nivelEscolaridade,
      periodoConclusao,
      disponivel,
      tempoDisponivel,
      lattes,
      areasInteresse,
      habilidades,
    } = candidato;

    const embedding: string[] = [
      String(nivelEscolaridade),
      this.limpaTexto(areaAtuacao),
      String(periodoConclusao),
      disponivel ? 'sim' : 'nao',
      String(tempoDisponivel),
      this.limpaTexto(lattes ?? ''),
      this.limpaTexto(areasInteresse.join(' ')),
      this.limpaTexto(habilidades.join(' ')),
    ];
    return embedding;
  }

  private limpaTexto(frase: string) {
    // lib para stopWords
    const wordExcludePtBr = ['por', 'favor', 'qual', 'valor'];
    return frase
      .trim()
      .toLowerCase()
      .replace(/\s\s+/g, '')
      .replace(/[.,/#!$%^&*;:{}=\-_`~()@]/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .filter(value => !wordExcludePtBr.includes(value))
      .join(' ');
  }
}

export const candidatoService = new CandidatoService();
