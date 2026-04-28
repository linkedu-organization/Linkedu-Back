import { TipoPerfil } from '@prisma/client';

import { CandidatoCreateDTO, CandidatoUpdateDTO } from '../models/CandidatoSchema';
import { perfilRepository } from './PerfilRepositoy';
import prisma from '../utils/prisma';
import { Filter, Sorter, buildWhereClause, buildOrderClause } from '../utils/filterUtils';
import {
  atualizaResumoCandidato,
  camposCandidato,
  gerarEmbeddingCandidato,
  gerarResumoCandidato,
} from '../utils/matchUtils';
import { recomendacaoRepository } from './RecomendacaoRepository';

class CandidatoRepository {
  async create(data: CandidatoCreateDTO) {
    const { perfil, ...candidato } = data;
    return prisma.$transaction(async tx => {
      const resumoCandidato = gerarResumoCandidato(data);
      const perfilCriado = await perfilRepository.create(tx, perfil, TipoPerfil.CANDIDATO);
      const candidatoCriado = await tx.candidato.create({
        data: { ...candidato, perfil: { connect: { id: perfilCriado.id } }, resumo: resumoCandidato },
        include: { perfil: true },
      });

      await gerarEmbeddingCandidato(tx, candidatoCriado, resumoCandidato);
      return candidatoCriado;
    });
  }

  async getById(id: number) {
    return prisma.candidato.findUnique({
      where: { id },
      include: { perfil: true, experiencias: true },
    });
  }

  async getAll(data: { filters: Filter[]; sorters: Sorter[] }) {
    return prisma.candidato.findMany({
      include: { perfil: true, experiencias: true },
      where: buildWhereClause(data.filters),
      orderBy: buildOrderClause(data.sorters),
    });
  }

  async update(id: number, data: CandidatoUpdateDTO) {
    const { perfil, ...candidato } = data;
    return prisma.$transaction(async tx => {
      let candidatoAtualizado = await tx.candidato.update({
        where: { id },
        data: {
          ...candidato,
          ...{ perfil: { update: perfil } },
        },
        include: { perfil: true, experiencias: true },
      });

      const camposModificados = camposCandidato.some(campo => data[campo as keyof typeof data] !== undefined);

      if (camposModificados) {
        const candidatoComResumo = await atualizaResumoCandidato(tx, id);
        if (candidatoComResumo) {
          candidatoAtualizado = { ...candidatoAtualizado, ...candidatoComResumo };
        }
      }

      return candidatoAtualizado;
    });
  }

  async delete(id: number) {
    return prisma.$transaction(async tx => {
      const candidato = await tx.candidato.delete({
        where: { id },
      });
      await perfilRepository.delete(tx, candidato.perfilId);
      await recomendacaoRepository.deleteByCandidatoId(tx, id);
      return candidato;
    });
  }
}

export const candidatoRepository = new CandidatoRepository();
