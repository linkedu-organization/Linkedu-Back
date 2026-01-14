import { CandidatoUpdateDTO } from '../../src/models/CandidatoSchema';
import { candidatoRepository } from '../../src/repositories/CandidatoRepository';
import { candidatoService } from '../../src/services/CandidatoService';
import { perfilService } from '../../src/services/PerfilService';

jest.mock('../../src/repositories/CandidatoRepository', () => ({
  candidatoRepository: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
  },
}));

const makePerfil = (overrides = {}) => ({
  nome: 'Chappell Roan',
  email: 'chappell.roan@ccc.ufcg.edu.br',
  senha: 'lollapalooza_2026',
  foto: 'https://drive.google.com',
  biografia: 'Biografia...',
  ...overrides,
});

const makePerfilResponse = (overrides = {}) => ({
  id: 1,
  nome: 'Chappell Roan',
  email: 'chappell.roan@ccc.ufcg.edu.br',
  tipo: 'CANDIDATO' as const,
  foto: 'https://drive.google.com',
  biografia: 'Biografia...',
  createdAt: new Date(),
  updatedAt: new Date(),
  ultimoAcesso: new Date(),
  ...overrides,
});

const makeCandidato = (overrides = {}) => ({
  cargo: 'ALUNO' as const,
  instituicao: 'UFCG',
  areaAtuacao: 'Ciência da Computação',
  nivelEscolaridade: 'SUPERIOR_INCOMPLETO' as const,
  periodoIngresso: '202210',
  periodoConclusao: '202612',
  disponivel: true,
  tempoDisponivel: 'DE_20_A_30H' as const,
  lattes: 'chappelldivalattes.com',
  linkedin: 'chappelldivalinkedin.com',
  areasInteressse: ['DESENVOLVIMENTO_WEB', 'IA'],
  habilidades: ['INGLES', 'JAVASCRIPT', 'JAVA', 'REACT'],
  perfil: makePerfil(),
  ...overrides,
});

const makeCandidatoResponse = (overrides = {}) => ({
  id: 1,
  cargo: 'ALUNO' as const,
  instituicao: 'UFCG',
  areaAtuacao: 'Ciência da Computação',
  nivelEscolaridade: 'SUPERIOR_INCOMPLETO' as const,
  periodoIngresso: '202210',
  periodoConclusao: '202612',
  disponivel: true,
  tempoDisponivel: 'DE_20_A_30H' as const,
  lattes: 'chappelldivalattes.com',
  linkedin: 'chappelldivalinkedin.com',
  areasInteressse: ['DESENVOLVIMENTO_WEB', 'IA'],
  habilidades: ['INGLES', 'JAVASCRIPT', 'JAVA', 'REACT'],
  perfil: makePerfilResponse(),
  ...overrides,
});

const mockCreate = (v: any) => (candidatoRepository.create as jest.Mock).mockResolvedValue(v);
const mockUpdate = (v: any) => (candidatoRepository.update as jest.Mock).mockResolvedValue(v);
const mockGetById = (v: any) => (candidatoRepository.getById as jest.Mock).mockResolvedValue(v);
const mockGetAll = (v: any) => (candidatoRepository.getAll as jest.Mock).mockResolvedValue(v);
const mockDelete = () => (candidatoRepository.delete as jest.Mock).mockResolvedValue(undefined);

describe('Cria candidato', () => {
  test('case 1: com todos os campos', async () => {
    const candidato = makeCandidato();
    const response = makeCandidatoResponse();

    mockCreate(response);
    const result = await candidatoService.create(candidato);

    expect(candidatoRepository.create).toHaveBeenCalled();
    const payload = (candidatoRepository.create as jest.Mock).mock.calls[0][0];
    expect(payload.cargo).toBe('ALUNO');
    expect(payload.perfil.nome).toBe('Chappell Roan');

    expect(result.perfil).not.toHaveProperty('senha');
  });

  test('case 2: removendo opcionais (deixando-os nulos)', async () => {
    const candidato = makeCandidato({
      perfil: makePerfil({ foto: null, biografia: null }),
    });

    mockCreate(makeCandidatoResponse({ perfil: makePerfilResponse({ foto: null, biografia: null }) }));
    await candidatoService.create(candidato);

    const payload = (candidatoRepository.create as jest.Mock).mock.calls[0][0];
    expect(payload.perfil.foto).toBeNull();
    expect(payload.perfil.biografia).toBeNull();
  });

  test('case 3: rejeita senha menor que o tamanho mínimo', async () => {
    const candidato = makeCandidato({
      perfil: makePerfil({ senha: 'a' }),
    });

    await expect(candidatoService.create(candidato)).rejects.toThrow();
  });

  test('case 4: com email único no sistema', async () => {
    const candidato = makeCandidato();
    const response = makeCandidatoResponse();

    jest.spyOn(perfilService, 'validarEmail').mockResolvedValue(undefined);
    (candidatoRepository.create as jest.Mock).mockResolvedValue(response);

    const result = await candidatoService.create(candidato);

    expect(perfilService.validarEmail).toHaveBeenCalledWith(candidato.perfil.email);
    expect(candidatoRepository.create).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  test('case 5: rejeita quando email já existe', async () => {
    const candidato = makeCandidato();

    jest.spyOn(perfilService, 'validarEmail').mockRejectedValue(new Error('Email já cadastrado'));

    await expect(candidatoService.create(candidato)).rejects.toThrow('Email já cadastrado');

    expect(perfilService.validarEmail).toHaveBeenCalledWith(candidato.perfil.email);
    expect(candidatoRepository.create).not.toHaveBeenCalled();
  });
});

describe('Atualiza candidato', () => {
  test('case 1: com dados válidos', async () => {
    const response = makeCandidatoResponse({
      cargo: 'TECNICO',
      instituicao: 'UFPB',
    });

    mockGetById(makeCandidatoResponse());
    mockUpdate(response);

    const dto: CandidatoUpdateDTO = {
      ...response,
      perfil: makePerfil(),
    };
    const result = await candidatoService.update(1, dto);
    const [, payload] = (candidatoRepository.update as jest.Mock).mock.calls[0];
    expect(payload.cargo).toBe('TECNICO');
    expect(payload.instituicao).toBe('UFPB');

    expect(result).toEqual(response);
  });

  test('case 2: remove opcionais', async () => {
    mockUpdate(
      makeCandidatoResponse({
        perfil: makePerfilResponse({ foto: null, biografia: null }),
      }),
    );

    await candidatoService.update(1, {
      ...makeCandidato({ perfil: makePerfil({ foto: null, biografia: null }) }),
    });

    const [, payload] = (candidatoRepository.update as jest.Mock).mock.calls[0];
    expect(payload.perfil.foto).toBeNull();
    expect(payload.perfil.biografia).toBeNull();
  });

  test('case 3: id inválido lança erro', async () => {
    (candidatoRepository.update as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));
    await expect(candidatoService.update(-1, {} as any)).rejects.toThrow();
  });
});

describe('Recupera candidato pelo id', () => {
  test('case 1: retorna candidato existente', async () => {
    const response = makeCandidatoResponse();
    mockGetById(response);

    const result = await candidatoService.getById(1);

    expect(result).toEqual(response);
  });

  test('case 2: id inválido lança erro', async () => {
    (candidatoRepository.getById as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(candidatoService.getById(-1)).rejects.toThrow();
  });
});

describe('Recupera todos os candidatoes', () => {
  test('case 1: retorna lista', async () => {
    const list = [makeCandidatoResponse()];
    mockGetAll(list);

    const result = await candidatoService.getAll();

    expect(result).toEqual(list);
  });

  test('case 2: retorna lista vazia, pois não foi criado candidato', async () => {
    mockGetAll([]);

    const result = await candidatoService.getAll();

    expect(result).toEqual([]);
  });
});

describe('Deleta candidato', () => {
  test('case 1: com id válido', async () => {
    mockGetById(makeCandidatoResponse());
    mockDelete();

    await candidatoService.delete(1);

    expect(candidatoRepository.delete).toHaveBeenCalledWith(1);
  });

  test('case 2: com id inválido lança erro', async () => {
    (candidatoRepository.delete as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(candidatoService.delete(-1)).rejects.toThrow();
  });
});
