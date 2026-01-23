import { VagaUpdateDTO } from '../../src/models/VagaSchema';
import { vagaRepository } from '../../src/repositories/VagaRepository';
import { vagaService } from '../../src/services/VagaService';

jest.mock('../../src/repositories/VagaRepository', () => ({
  vagaRepository: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
  },
}));

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

const makeRecrutadorResponse = (overrides = {}) => ({
  id: 1,
  cargo: 'PROFESSOR',
  instituicao: 'UFCG',
  areaAtuacao: 'Software Developing',
  laboratorios: 'LSI',
  perfil: makePerfilResponse(),
  ...overrides,
});

const makeVaga = (overrides = {}) => ({
  titulo: 'Estágio em Desenvolvimento de Software',
  descricao: 'Descrição da vaga...',
  categoria: 'PROJETO_PESQUISA' as
    | 'PROJETO_PESQUISA'
    | 'PROJETO_PESQUISA_DESENVOLVIMENTO'
    | 'PROJETO_PESQUISA_DESENVOLVIMENTO_INOVACAO'
    | 'PROJETO_EXTENSAO'
    | 'MONITORIA'
    | 'ORGANIZACAO_EVENTO'
    | 'OUTROS',
  ehPublica: true,
  ehRemunerada: true,
  dataExpiracao: null,
  cargaHoraria: 20,
  duracao: '6 meses',
  instituicao: 'UFCG',
  curso: 'Ciência da Computação',
  linkInscricao: 'https://inscricao.vaga.com',
  local: 'Campina Grande - PB',
  publicoAlvo: ['ALUNO_GRADUACAO'] as ('ALUNO_GRADUACAO' | 'ALUNO_POS_GRADUACAO' | 'TECNICO' | 'PESQUISADOR')[],
  conhecimentosObrigatorios: ['JavaScript', 'TypeScript'],
  conhecimentosOpcionais: ['React', 'Node.js'],
  ...overrides,
});

const makeVagaResponse = (overrides = {}) => ({
  id: 1,
  recrutador: makeRecrutadorResponse(),
  titulo: 'Estágio em Desenvolvimento de Software',
  descricao: 'Descrição da vaga...',
  categoria: 'PROJETO_PESQUISA',
  ehPublica: true,
  ehRemunerada: true,
  dataExpiracao: null,
  cargaHoraria: 20,
  duracao: '6 meses',
  instituicao: 'UFCG',
  curso: 'Ciência da Computação',
  linkInscricao: 'https://inscricao.vaga.com',
  local: 'Campina Grande - PB',
  publicoAlvo: ['ALUNO_GRADUACAO'],
  conhecimentosObrigatorios: ['JavaScript', 'TypeScript'],
  conhecimentosOpcionais: ['React', 'Node.js'],

  ...overrides,
});

const mockCreate = (v: any) => (vagaRepository.create as jest.Mock).mockResolvedValue(v);
const mockUpdate = (v: any) => (vagaRepository.update as jest.Mock).mockResolvedValue(v);
const mockGetById = (v: any) => (vagaRepository.getById as jest.Mock).mockResolvedValue(v);
const mockGetAll = (v: any) => (vagaRepository.getAll as jest.Mock).mockResolvedValue(v);
const mockDelete = () => (vagaRepository.delete as jest.Mock).mockResolvedValue(undefined);

describe('Cria vaga', () => {
  test('case 1: com todos os campos', async () => {
    const vaga = makeVaga();
    const response = makeVagaResponse();

    mockCreate(response);

    const result = await vagaService.create(vaga, 1);

    expect(vagaRepository.create).toHaveBeenCalledWith(vaga, 1);
    expect(result).toEqual(response);
  });

  test('case 2: removendo opcionais (deixando-os nulos)', async () => {
    const vaga = makeVaga({
      dataExpiracao: null,
      duracao: null,
      conhecimentosOpcionais: [],
    });
    mockCreate(
      makeVagaResponse({
        dataExpiracao: null,
        duracao: null,
        conhecimentosOpcionais: [],
      }),
    );
    await vagaService.create(vaga, 1);
    const payload = (vagaRepository.create as jest.Mock).mock.calls[0][0];
    expect(payload.dataExpiracao).toBeNull();
    expect(payload.duracao).toBeNull();
    expect(payload.conhecimentosOpcionais).toEqual([]);
  });
});

describe('Atualiza vaga', () => {
  test('case 1: atualiza campos da vaga', async () => {
    const vagaUpdate: VagaUpdateDTO = {
      titulo: 'Título Atualizado',
      descricao: 'Descrição Atualizada',
      categoria: 'PROJETO_PESQUISA',
      ehPublica: false,
      ehRemunerada: true,
      cargaHoraria: 30,
      instituicao: 'UFRJ',
      curso: 'Engenharia de Software',
      linkInscricao: 'https://inscricao.atualizada.com',
      local: 'Rio de Janeiro - RJ',
      publicoAlvo: ['ALUNO_POS_GRADUACAO'],
      conhecimentosObrigatorios: ['Python', 'Django'],
      conhecimentosOpcionais: ['Docker', 'Kubernetes'],
    };

    const existingVaga = makeVagaResponse({ id: 1 });
    const updatedVaga = makeVagaResponse({ id: 1, ...vagaUpdate });

    mockGetById(existingVaga);
    mockUpdate(updatedVaga);

    const result = await vagaService.update(1, vagaUpdate);

    expect(vagaRepository.getById).toHaveBeenCalledWith(1);
    expect(vagaRepository.update).toHaveBeenCalledWith(1, vagaUpdate);
    expect(result).toEqual(updatedVaga);
  });
});

describe('Recupera vaga pelo id', () => {
  test('case 1: retorna vaga existente', async () => {
    const response = makeVagaResponse();
    mockGetById(response);

    const result = await vagaService.getById(1);

    expect(vagaRepository.getById).toHaveBeenCalledWith(1);
    expect(result).toEqual(response);
  });

  test('case 2: vaga inexistente lança erro', async () => {
    (vagaRepository.getById as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(vagaService.getById(-1)).rejects.toThrow('Entidade com id -1 não encontrada');
  });
});

describe('Recupera todas as vagas', () => {
  test('case 1: retorna lista de vagas', async () => {
    const response = [makeVagaResponse(), makeVagaResponse({ id: 2 })];
    mockGetAll(response);

    const result = await vagaService.getAll();

    expect(vagaRepository.getAll).toHaveBeenCalled();
    expect(result).toEqual(response);
  });
});

describe('Deleta vaga', () => {
  test('case 1: com id válido', async () => {
    mockGetById(makeVagaResponse());
    mockDelete();

    await vagaService.delete(1);

    expect(vagaRepository.delete).toHaveBeenCalledWith(1);
  });

  test('case 2: com id inválido lança erro', async () => {
    (vagaRepository.delete as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(vagaService.delete(-1)).rejects.toThrow('Entidade com id -1 não encontrada');
  });
});
