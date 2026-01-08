import { recrutadorService } from '../../src/services/RecrutadorService';
import { recrutadorRepository } from '../../src/repositories/RecrutadorRepository';

jest.mock('../src/repositories/RecrutadorRepository');

describe('RecrutadorService', () => {
  const mockProfileRequest = {
    nome: 'Luísa Ledra',
    email: 'luisa.ledra@gmail.com',
    senha: 'cnh_2025',
    tipo: 'RECRUTADOR' as const,
    foto: 'https://drive.google.com/drive/u/0/folders/1QjlkrHlWhnyEQZwFK9pCNduJVP0NPL4I',
    biografia: 'Biografia é um gênero textual que narra a história da vida de uma pessoa.',
  };

  const profileSemOpcionais = { ...mockProfileRequest, foto: null, biografia: null };

  const mockRecrutadorRequest = {
    cargo: 'PROFESSOR' as const,
    instituicao: 'UFCG',
    areaAtuacao: 'Software Developing',
    laboratorios: 'LSI',
    perfil: mockProfileRequest,
  };

  const mockRecrutadorResponse = {
    cargo: 'PROFESSOR',
    instituicao: 'UFCG',
    areaAtuacao: 'Software Developing',
    laboratorios: 'LSI',
    id: 1,
    perfil: {
      id: 1,
      tipo: 'RECRUTADOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  test('Case 0: Cria um Recrutador com todos os campos preenchidos.', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(mockRecrutadorResponse);

    const actual = await recrutadorService.create(mockRecrutadorRequest);

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

    const actual = await recrutadorService.create({ ...mockRecrutadorRequest, perfil: profileSemOpcionais });

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
