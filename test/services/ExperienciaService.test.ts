import { response } from 'express';

import { ExperienciaUpdateDTO } from '../../src/models/ExperienciaSchema';
import { experienciaRepository } from '../../src/repositories/ExperienciaRepository';
import { experienciaService } from '../../src/services/ExperienciaService';
import * as authUtils from '../../src/utils/authUtils';
import { vagaService } from '../../src/services/VagaService';

jest.mock('../../src/repositories/ExperienciaRepository', () => ({
  experienciaRepository: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
  },
}));

const makeExperiencia = (overrides = {}) => ({
  candidatoId: 1,
  titulo: 'TCE',
  descricao: 'Experiência mt boa',
  orientador: 'Claudio Baptista',
  instituicao: 'UFCG',
  periodoInicio: '01/2026',
  periodoFim: null as string | null,
  local: 'LSI' as string | null,
  ...overrides,
});

const makeExperienciaResponse = (overrides = {}) => {
  const { candidatoId, ...experiencia } = makeExperiencia();
  const temp = experiencia;
  return {
    id: 1,
    ...temp,
    ...overrides,
  };
};

const AUTH_TOKEN = 'testAuthToken';
const mockCreate = (v: any) => (experienciaRepository.create as jest.Mock).mockResolvedValue(v);
const mockUpdate = (v: any) => (experienciaRepository.update as jest.Mock).mockResolvedValue(v);
const mockGetById = (v: any) => (experienciaRepository.getById as jest.Mock).mockResolvedValue(v);
const mockGetAll = (v: any) => (experienciaRepository.getAll as jest.Mock).mockResolvedValue(v);
const mockDelete = () => (experienciaRepository.delete as jest.Mock).mockResolvedValue(undefined);

describe('Cria Experiência', () => {
  test('case 1: com todos os campos', async () => {
    const experiencia = makeExperiencia();
    const response = makeExperienciaResponse();

    mockCreate(response);

    const getAuthTokenId = jest.spyOn(authUtils, 'getAuthTokenId').mockReturnValue(1);
    const result = await experienciaService.create(experiencia, AUTH_TOKEN);

    expect(getAuthTokenId).toHaveBeenCalledWith(AUTH_TOKEN);
    expect(experienciaRepository.create).toHaveBeenCalledWith(experiencia, 1);
    expect(result).toEqual(response);
  });

  test('case 2: removendo opcionais (deixando-os nulos)', async () => {
    const overrides = { periodoFim: null, local: null };
    const experiencia = makeExperiencia(overrides);
    mockCreate(makeExperienciaResponse(overrides));

    const getAuthTokenId = jest.spyOn(authUtils, 'getAuthTokenId').mockReturnValue(1);
    await experienciaService.create(experiencia, AUTH_TOKEN);
    const result = (experienciaRepository.create as jest.Mock).mock.calls[0][0];

    expect(getAuthTokenId).toHaveBeenCalledWith(AUTH_TOKEN);
    expect(result.periodoFim).toBeNull();
    expect(result.local).toBeNull();
  });
});

describe('Atualiza vaga', () => {
  test('case 1: atualiza campos da experiência', async () => {
    const experiencia = makeExperiencia();
    const updateExperiencia: ExperienciaUpdateDTO = {
      ...experiencia,
      descricao: 'Muito agradável!',
      local: 'LSI - Bloco CN',
    };

    const experienciaUpdatedResponse = makeExperienciaResponse(updateExperiencia);

    mockGetById(experienciaUpdatedResponse);
    mockUpdate(experienciaUpdatedResponse);

    const ensureSelfTargetedAction = jest.spyOn(authUtils, 'ensureSelfTargetedAction').mockReturnValue(undefined);
    const result = await experienciaService.update(1, updateExperiencia, AUTH_TOKEN);

    expect(ensureSelfTargetedAction).toHaveBeenCalledWith(1, AUTH_TOKEN);
    expect(experienciaRepository.update).toHaveBeenCalled();
    const { candidatoId, ...resto } = experienciaUpdatedResponse;
    expect(result).toEqual(resto);
  });
});

describe('Recupera vaga pelo id', () => {
  test('case 1: case 1: retorna vaga existente', async () => {
    const experienciaResponse = makeExperienciaResponse();
    mockGetById(experienciaResponse);

    const result = await experienciaService.getById(1);

    expect(experienciaRepository.getById).toHaveBeenCalledWith(1);
    expect(result).toEqual(experienciaResponse);
  });

  test('case 2: experiência inexistente lança erro', async () => {
    (experienciaRepository.getById as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(experienciaService.getById(-1)).rejects.toThrow('Entidade com id -1 não encontrada');
  });
});

describe('Recupera todas as experiencia', () => {
  test('case 1: retorna lista de experiencia', async () => {
    const response = [makeExperienciaResponse(), makeExperienciaResponse({ id: 2 })];
    mockGetAll(response);

    const result = await experienciaService.getAll();

    expect(experienciaRepository.getAll).toHaveBeenCalled();
    expect(result).toEqual(response);
  });
});

describe('Deleta vaga', () => {
  test('case 1: com id válido', async () => {
    mockGetById(makeExperienciaResponse());
    mockDelete();

    const ensureSelfTargetedAction = jest.spyOn(authUtils, 'ensureSelfTargetedAction').mockReturnValue(undefined);
    await experienciaService.delete(1, AUTH_TOKEN);

    // expect(ensureSelfTargetedAction).toHaveBeenCalledWith(1, AUTH_TOKEN);
    expect(experienciaRepository.delete).toHaveBeenCalledWith(1);
  });

  test('case 2: com id inválido lança erro', async () => {
    jest.spyOn(authUtils, 'ensureSelfTargetedAction').mockReturnValue(undefined);
    (experienciaRepository.delete as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(experienciaService.delete(-1, AUTH_TOKEN)).rejects.toThrow('Entidade com id -1 não encontrada');
  });
});
