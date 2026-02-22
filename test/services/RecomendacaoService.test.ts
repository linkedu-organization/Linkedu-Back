import { recomendacaoRepository } from '../../src/repositories/RecomendacaoRepository';
import { candidatoService } from '../../src/services/CandidatoService';
import { recomendacaoService } from '../../src/services/RecomendacaoService';
import { vagaService } from '../../src/services/VagaService';
import * as authUtils from '../../src/utils/authUtils';

jest.mock('../../src/repositories/RecomendacaoRepository', () => ({
  recomendacaoRepository: {
    createRecomendacaoVagas: jest.fn(),
    createRecomendacaoCandidatos: jest.fn(),
    getRecomendacaoCandidatos: jest.fn(),
    getRecomendacaoVagas: jest.fn(),
  },
}));

// Criando vagas
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
  recrutadorId: 1,
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

// criando candidato

const makePerfil = (overrides = {}) => ({
  nome: 'Chappell Roan',
  email: 'chappell.roan@ccc.ufcg.edu.br',
  senha: 'lollapalooza_2026',
  foto: 'https://drive.google.com',
  biografia: 'Biografia...',
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
  tempoDisponivel: 20,
  lattes: 'chappelldivalattes.com',
  linkedin: 'chappelldivalinkedin.com',
  areasInteresse: ['DESENVOLVIMENTO_WEB', 'IA'],
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
  tempoDisponivel: 20,
  lattes: 'chappelldivalattes.com',
  linkedin: 'chappelldivalinkedin.com',
  areasInteresse: ['DESENVOLVIMENTO_WEB', 'IA'],
  habilidades: ['INGLES', 'JAVASCRIPT', 'JAVA', 'REACT'],
  perfil: makePerfilResponse(),
  ...overrides,
});

const AUTH_TOKEN = 'testAuthToken';
const mockCreateRecomendacaoVagas = recomendacaoRepository.createRecomendacaoVagas as jest.Mock;
const mockCreateRecomendacaoCandidatos = recomendacaoRepository.createRecomendacaoCandidatos as jest.Mock;
const mockGetRecomendacaoCandidatos = recomendacaoRepository.getRecomendacaoCandidatos as jest.Mock;
const mockGetRecomendacaoVagas = recomendacaoRepository.getRecomendacaoVagas as jest.Mock;

describe('Recomendacao de vagas para o candidato logado', () => {
  test('Deve criar recomendações de vagas para o candidato logado', async () => {
    const getAuthTokenId = jest.spyOn(authUtils, 'getAuthTokenId').mockReturnValue(1);

    const candidatoServiceGetById = jest.spyOn(candidatoService, 'getById').mockResolvedValue({} as any);

    mockCreateRecomendacaoVagas.mockResolvedValueOnce([]);
    await recomendacaoService.createRecomendacaoVagas(AUTH_TOKEN);

    expect(getAuthTokenId).toHaveBeenCalledWith(AUTH_TOKEN);
    expect(candidatoServiceGetById).toHaveBeenCalledWith(1);
    expect(mockCreateRecomendacaoVagas).toHaveBeenCalledWith(1);
  });
});

describe('Recomendacao de candidatos para uma vaga', () => {
  test('Deve criar recomendações de candidatos para uma vaga', async () => {
    const vagaServiceGetById = jest.spyOn(vagaService, 'getById').mockResolvedValue({} as any);

    mockCreateRecomendacaoCandidatos.mockResolvedValueOnce([]);
    await recomendacaoService.createRecomendacaoCandidatos(1);

    expect(vagaServiceGetById).toHaveBeenCalledWith(1);
    expect(mockCreateRecomendacaoCandidatos).toHaveBeenCalledWith(1);
  });
});

describe('Get de recomendações de vagas para o candidato logado', () => {
  test('Deve obter recomendações de vagas para o candidato logado', async () => {
    const getAuthTokenId = jest.spyOn(authUtils, 'getAuthTokenId').mockReturnValue(1);

    const candidatoServiceGetById = jest.spyOn(candidatoService, 'getById').mockResolvedValue({} as any);

    mockGetRecomendacaoVagas.mockResolvedValueOnce([]);
    await recomendacaoService.getRecomendacaoVagas(AUTH_TOKEN);

    expect(getAuthTokenId).toHaveBeenCalledWith(AUTH_TOKEN);
    expect(candidatoServiceGetById).toHaveBeenCalledWith(1);
    expect(mockGetRecomendacaoVagas).toHaveBeenCalledWith(1);
  });
});

describe('Get de recomendações de candidatos para uma vaga', () => {
  test('Deve obter recomendações de candidatos para uma vaga', async () => {
    mockGetRecomendacaoCandidatos.mockResolvedValueOnce([]);
    await recomendacaoService.getRecomendacaoCandidatos(1);

    expect(mockGetRecomendacaoCandidatos).toHaveBeenCalledWith(1);
  });
});
