import { recomendacaoRepository } from '../../src/repositories/RecomendacaoRepository';
import { candidatoService } from '../../src/services/CandidatoService';
import { recomendacaoService } from '../../src/services/RecomendacaoService';
import { vagaService } from '../../src/services/VagaService';
import * as authUtils from '../../src/utils/authUtils';
import * as matchUtils from '../../src/utils/matchUtils';

jest.mock('../../src/repositories/RecomendacaoRepository', () => ({
  recomendacaoRepository: {
    createRecomendacaoVagas: jest.fn(),
    createRecomendacaoCandidatos: jest.fn(),
    getRecomendacaoCandidatos: jest.fn(),
    getRecomendacaoVagas: jest.fn(),
  },
}));

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
      $executeRawUnsafe: jest.fn(),
      recomendacao: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    })),
    Prisma: {
      sql: () => '',
    },
  };
});

const AUTH_TOKEN = 'testAuthToken';
const mockCreateRecomendacaoVagas = recomendacaoRepository.createRecomendacaoVagas as jest.Mock;
const mockCreateRecomendacaoCandidatos = recomendacaoRepository.createRecomendacaoCandidatos as jest.Mock;
const mockGetRecomendacaoCandidatos = recomendacaoRepository.getRecomendacaoCandidatos as jest.Mock;
const mockGetRecomendacaoVagas = recomendacaoRepository.getRecomendacaoVagas as jest.Mock;

describe('Cria Recomendação', () => {
  test('case 1: recomendações de vagas para candidato logado', async () => {
    const getAuthTokenId = jest.spyOn(authUtils, 'getAuthTokenId').mockReturnValue(1);
    const candidatoServiceGetById = jest.spyOn(candidatoService, 'getById').mockResolvedValue({} as any);
    const embedding = jest.spyOn(matchUtils, 'getVectorEmbedding').mockResolvedValue('[0.1,0.2]');
    const calculaSimilaridade = jest
      .spyOn(matchUtils, 'calculaSimilaridade')
      .mockResolvedValue([{ similarity: 10 }, { similarity: 20 }] as any);

    mockCreateRecomendacaoVagas.mockResolvedValueOnce([]);

    await recomendacaoService.createRecomendacaoVagas(AUTH_TOKEN);

    expect(getAuthTokenId).toHaveBeenCalledWith(AUTH_TOKEN);
    expect(candidatoServiceGetById).toHaveBeenCalledWith(1);
    expect(embedding).toHaveBeenCalledWith('Candidato', 1);
    expect(calculaSimilaridade).toHaveBeenCalledWith('[0.1,0.2]', 'Vaga', expect.anything());
    expect(mockCreateRecomendacaoVagas).toHaveBeenCalledWith([{ similarity: 10 }, { similarity: 20 }], 1);
  });

  test('case 2: recomendações de candidatos para uma vaga', async () => {
    const vagaServiceGetById = jest.spyOn(vagaService, 'getById').mockResolvedValue({} as any);
    const embedding = jest.spyOn(matchUtils, 'getVectorEmbedding').mockResolvedValue('[0.1,0.2]');
    const calculaSimilaridade = jest
      .spyOn(matchUtils, 'calculaSimilaridade')
      .mockResolvedValue([{ similarity: 10 }, { similarity: 20 }] as any);

    mockCreateRecomendacaoCandidatos.mockResolvedValueOnce([]);
    await recomendacaoService.createRecomendacaoCandidatos(1);

    expect(embedding).toHaveBeenCalledWith('Vaga', 1);
    expect(calculaSimilaridade).toHaveBeenCalledWith('[0.1,0.2]', 'Candidato', expect.anything());
    expect(vagaServiceGetById).toHaveBeenCalledWith(1);
    expect(mockCreateRecomendacaoCandidatos).toHaveBeenCalledWith([{ similarity: 10 }, { similarity: 20 }], 1);
  });
});

describe('Recupera recomendações', () => {
  test('case 1: vagas para candidato', async () => {
    const getAuthTokenId = jest.spyOn(authUtils, 'getAuthTokenId').mockReturnValue(1);

    const candidatoServiceGetById = jest.spyOn(candidatoService, 'getById').mockResolvedValue({} as any);

    mockGetRecomendacaoVagas.mockResolvedValueOnce([]);
    await recomendacaoService.getRecomendacaoVagas(AUTH_TOKEN);

    expect(getAuthTokenId).toHaveBeenCalledWith(AUTH_TOKEN);
    expect(candidatoServiceGetById).toHaveBeenCalledWith(1);
    expect(mockGetRecomendacaoVagas).toHaveBeenCalledWith(1);
  });

  test('case 2: candidatos para vaga', async () => {
    mockGetRecomendacaoCandidatos.mockResolvedValueOnce([]);
    await recomendacaoService.getRecomendacaoCandidatos(1);

    expect(mockGetRecomendacaoCandidatos).toHaveBeenCalledWith(1);
  });
});
