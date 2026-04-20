import { VagaCreateDTO, VagaUpdateDTO } from '../models/VagaSchema';
import prisma from '../utils/prisma';
import { Filter, Sorter, buildWhereClause, buildOrderClause } from '../utils/filterUtils';
import { camposVaga, gerarEmbeddingVaga, gerarResumoVaga } from '../utils/matchUtils';
import { recomendacaoRepository } from './RecomendacaoRepository';

class VagaRepository {
  async create(data: VagaCreateDTO, recrutadorId: number) {
    return prisma.$transaction(async tx => {
      const resumoVaga = gerarResumoVaga(data);
      const vagaCriada = await tx.vaga.create({
        data: { ...data, recrutadorId, resumo: resumoVaga },
        include: { recrutador: { include: { perfil: true } } },
      });

      await gerarEmbeddingVaga(tx, vagaCriada, resumoVaga);
      return vagaCriada;
    });
  }

  async getById(id: number) {
    return prisma.vaga.findUnique({
      where: { id },
      include: { recrutador: { include: { perfil: true } } },
    });
  }

  async getAll(data: { filters: Filter[]; sorters: Sorter[] }) {
    return prisma.vaga.findMany({
      include: { recrutador: { include: { perfil: true } } },
      where: buildWhereClause(data.filters),
      orderBy: buildOrderClause(data.sorters),
    });
  }

  async update(id: number, data: VagaUpdateDTO) {
    return prisma.$transaction(async tx => {
      const vagaAtual = await tx.vaga.findUniqueOrThrow({ where: { id } });
      const dadosFiltrados = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
      const vagaCompleta: VagaCreateDTO = { ...vagaAtual, ...dadosFiltrados } as VagaCreateDTO;
      const resumoVaga = gerarResumoVaga(vagaCompleta);
      const vagaAtualizada = await tx.vaga.update({
        where: { id },
        data: { ...dadosFiltrados, resumo: resumoVaga },
        include: { recrutador: { include: { perfil: true } } },
      });

      const camposModificados = camposVaga.some(campo => data[campo as keyof typeof data] !== undefined);
      if (camposModificados) {
        await gerarEmbeddingVaga(tx, vagaAtualizada, resumoVaga);
      }
      return vagaAtualizada;
    });
  }

  async delete(id: number) {
    prisma.$transaction(async tx => {
      const vaga = await tx.vaga.delete({
        where: { id },
      });
      await recomendacaoRepository.deleteByVagaId(tx, id);
      return vaga;
    });
  }
}

export const vagaRepository = new VagaRepository();
