import { recrutadorService } from '../../src/services/RecrutadorService';
import { recrutadorRepository } from '../../src/repositories/RecrutadorRepository';

jest.mock('../../src/repositories/RecrutadorRepository');

describe('RecrutadorService', () => {
  const perfilRequest = {
    nome: 'Luísa Ledra',
    email: 'luisa.ledra@gmail.com',
    senha: 'cnh_2025',
    tipo: 'RECRUTADOR' as const,
    foto: 'https://drive.google.com/drive/u/0/folders/1QjlkrHlWhnyEQZwFK9pCNduJVP0NPL4I',
    biografia: 'Biografia é um gênero textual que narra a história da vida de uma pessoa.',
  };

  const perfilRequestSemOpcionais = { ...perfilRequest, foto: null, biografia: null };

  const pefilResponse = {
    id: 1,
    nome: perfilRequest.nome,
    email: perfilRequest.email,
    tipo: perfilRequest.tipo,
    foto: perfilRequest.foto,
    biografia: perfilRequest.biografia,
    createdAt: new Date(),
    updatedAt: new Date(),
    ultimoAcesso: new Date(),
  };

  const recrutadorRequest = {
    cargo: 'PROFESSOR' as const,
    instituicao: 'UFCG',
    areaAtuacao: 'Software Developing',
    laboratorios: 'LSI',
    perfil: perfilRequest,
  };

  const mockRecrutadorResponse = {
    id: 1,
    cargo: recrutadorRequest.cargo,
    instituicao: recrutadorRequest.instituicao,
    areaAtuacao: recrutadorRequest.areaAtuacao,
    laboratorios: 'LSI',
    perfil: pefilResponse,
  };

  test('Case 0: Cria um Recrutador com todos os campos preenchidos.', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(mockRecrutadorResponse);

    const actual = await recrutadorService.create(recrutadorRequest);

    expect(recrutadorRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cargo: 'PROFESSOR',
        perfil: expect.objectContaining({
          tipo: 'RECRUTADOR',
        }),
      }),
    );

    expect(actual).toEqual(expect.objectContaining(mockRecrutadorResponse));
    expect(actual.perfil).not.toHaveProperty('senha');
  });

  test('Case 1: Cria Recrutador apenas campos obrigatórios', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(mockRecrutadorResponse);

    const actual = await recrutadorService.create({ ...recrutadorRequest, perfil: perfilRequestSemOpcionais });

    expect(recrutadorRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cargo: 'PROFESSOR',
        perfil: expect.not.objectContaining({
          foto: expect.anything(),
          biografia: expect.anything(),
        }),
      }),
    );

    expect(actual).toEqual(expect.objectContaining(mockRecrutadorResponse));
    expect(actual.perfil).not.toHaveProperty('senha');
  });

  test('Case 2: Cria Recrutador faltando campo obrigatório (deve lançar erro)', () => {});
});
