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
