import { recrutadorService } from '../src/services/RecrutadorService';
import { recrutadorRepository } from '../src/repositories/RecrutadorRepository';

jest.mock('../src/repositories/RecrutadorRepository');

describe('RecrutadorService', () => {
  const mockRecrutadorDTO = {
    cargo: 'PROFESSOR' as const,
    instituicao: 'UFCG',
    areaAtuacao: 'Software Developing',
    laboratorios: 'LSI',
    perfil: {
      nome: 'Luísa Ledra',
      email: 'luisa.ledra@gmail.com',
      senha: 'cnh_2025',
      tipo: 'RECRUTADOR' as const,
    },
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

  test('case 0: Cria um Recrutador', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(mockRecrutadorResponse);

    const actual = await recrutadorService.create(mockRecrutadorDTO);

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
});
