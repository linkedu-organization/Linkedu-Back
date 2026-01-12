import { RecrutadorUpdateDTO } from '../../src/models/RecrutadorSchema';
import { recrutadorRepository } from '../../src/repositories/RecrutadorRepository';
import { recrutadorService } from '../../src/services/RecrutadorService';
import { perfilService } from '../../src/services/PerfilService';

jest.mock('../../src/repositories/RecrutadorRepository', () => ({
  recrutadorRepository: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
  },
}));

const makePerfil = (overrides = {}) => ({
  nome: 'Professor Medeiros',
  email: 'professor.medeiros@gmail.com',
  senha: 'cnh_brasil_2026',
  foto: 'https://drive.google.com',
  biografia: 'Biografia...',
  ...overrides,
});

const makePerfilResponse = (overrides = {}) => ({
  id: 1,
  nome: 'Professor Medeiros',
  email: 'professor.medeiros@gmail.com',
  tipo: 'RECRUTADOR',
  foto: 'https://drive.google.com',
  biografia: 'Biografia...',
  createdAt: new Date(),
  updatedAt: new Date(),
  ultimoAcesso: new Date(),
  ...overrides,
});

const makeRecrutador = (overrides = {}) => ({
  cargo: 'PROFESSOR' as const,
  instituicao: 'UFCG',
  areaAtuacao: 'Software Developing',
  laboratorios: 'LSI',
  perfil: makePerfil(),
  ...overrides,
});

const makeRecrutadorResponse = (overrides = {}) => ({
  id: 1,
  cargo: 'PROFESSOR',
  instituicao: 'UFCG',
  areaAtuacao: 'Software Developing',
  laboratorios: 'LSI',
  perfil: makePerfilResponse(),
  ...overrides,
});

const mockCreate = (v: any) => (recrutadorRepository.create as jest.Mock).mockResolvedValue(v);
const mockUpdate = (v: any) => (recrutadorRepository.update as jest.Mock).mockResolvedValue(v);
const mockGetById = (v: any) => (recrutadorRepository.getById as jest.Mock).mockResolvedValue(v);
const mockGetAll = (v: any) => (recrutadorRepository.getAll as jest.Mock).mockResolvedValue(v);
const mockDelete = () => (recrutadorRepository.delete as jest.Mock).mockResolvedValue(undefined);

describe('Cria recrutador', () => {
  test('case 1: com todos os campos', async () => {
    const recrutador = makeRecrutador();
    const response = makeRecrutadorResponse();

    mockCreate(response);
    const result = await recrutadorService.create(recrutador);

    expect(recrutadorRepository.create).toHaveBeenCalled();
    const payload = (recrutadorRepository.create as jest.Mock).mock.calls[0][0];
    expect(payload.cargo).toBe('PROFESSOR');
    expect(payload.perfil.nome).toBe('Professor Medeiros');

    expect(result.perfil).not.toHaveProperty('senha');
  });

  test('case 2: removendo opcionais (deixando-os nulos)', async () => {
    const recrutador = makeRecrutador({
      perfil: makePerfil({ foto: null, biografia: null }),
    });

    mockCreate(makeRecrutadorResponse({ perfil: makePerfilResponse({ foto: null, biografia: null }) }));
    await recrutadorService.create(recrutador);

    const payload = (recrutadorRepository.create as jest.Mock).mock.calls[0][0];
    expect(payload.perfil.foto).toBeNull();
    expect(payload.perfil.biografia).toBeNull();
  });

  test('case 3: rejeita senha menor que o tamanho mínimo', async () => {
    const recrutador = makeRecrutador({
      perfil: makePerfil({ senha: 'a' }),
    });

    await expect(recrutadorService.create(recrutador)).rejects.toThrow();
  });

  test('case 4: com email único no sistema', async () => {
    const recrutador = makeRecrutador();
    const response = makeRecrutadorResponse();

    jest.spyOn(perfilService, 'validarEmail').mockResolvedValue(undefined);
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(response);

    const result = await recrutadorService.create(recrutador);

    expect(perfilService.validarEmail).toHaveBeenCalledWith(recrutador.perfil.email);
    expect(recrutadorRepository.create).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  test('case 5: rejeita quando email já existe', async () => {
    const recrutador = makeRecrutador();

    jest.spyOn(perfilService, 'validarEmail').mockRejectedValue(new Error('Email já cadastrado'));

    await expect(recrutadorService.create(recrutador)).rejects.toThrow('Email já cadastrado');

    expect(perfilService.validarEmail).toHaveBeenCalledWith(recrutador.perfil.email);
    expect(recrutadorRepository.create).not.toHaveBeenCalled();
  });
});

describe('Atualiza recrutador', () => {
  test('case 1: com dados válidos', async () => {
    const response = makeRecrutadorResponse({
      cargo: 'PESQUISADOR',
      instituicao: 'UFPB',
    });

    mockGetById(makeRecrutadorResponse());
    mockUpdate(response);

    const dto: RecrutadorUpdateDTO = {
      cargo: 'PESQUISADOR' as const,
      instituicao: response.instituicao,
      areaAtuacao: response.areaAtuacao,
      laboratorios: response.laboratorios,
      perfil: makePerfil(),
    };
    const result = await recrutadorService.update(1, dto);
    const [, payload] = (recrutadorRepository.update as jest.Mock).mock.calls[0];
    expect(payload.cargo).toBe('PESQUISADOR');
    expect(payload.instituicao).toBe('UFPB');

    expect(result).toEqual(response);
  });

  test('case 2: remove opcionais', async () => {
    mockUpdate(
      makeRecrutadorResponse({
        perfil: makePerfilResponse({ foto: null, biografia: null }),
      }),
    );

    await recrutadorService.update(1, {
      ...makeRecrutador({ perfil: makePerfil({ foto: null, biografia: null }) }),
    });

    const [, payload] = (recrutadorRepository.update as jest.Mock).mock.calls[0];
    expect(payload.perfil.foto).toBeNull();
    expect(payload.perfil.biografia).toBeNull();
  });

  test('case 3: id inválido lança erro', async () => {
    (recrutadorRepository.update as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));
    await expect(recrutadorService.update(-1, {} as any)).rejects.toThrow();
  });
});

describe('Recupera recrutador pelo id', () => {
  test('case 1: retorna recrutador existente', async () => {
    const response = makeRecrutadorResponse();
    mockGetById(response);

    const result = await recrutadorService.getById(1);

    expect(result).toEqual(response);
  });

  test('case 2: id inválido lança erro', async () => {
    (recrutadorRepository.getById as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(recrutadorService.getById(-1)).rejects.toThrow();
  });
});

describe('Recupera todos os recrutadores', () => {
  test('case 1: retorna lista', async () => {
    const list = [makeRecrutadorResponse()];
    mockGetAll(list);

    const result = await recrutadorService.getAll();

    expect(result).toEqual(list);
  });

  test('case 2: retorna lista vazia, pois não foi criado recrutador', async () => {
    mockGetAll([]);

    const result = await recrutadorService.getAll();

    expect(result).toEqual([]);
  });
});

describe('Deleta recrutador', () => {
  test('case 1: com id válido', async () => {
    mockGetById(makeRecrutadorResponse());
    mockDelete();

    await recrutadorService.delete(1);

    expect(recrutadorRepository.delete).toHaveBeenCalledWith(1);
  });

  test('case 2: com id inválido lança erro', async () => {
    (recrutadorRepository.delete as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(recrutadorService.delete(-1)).rejects.toThrow();
  });
});
