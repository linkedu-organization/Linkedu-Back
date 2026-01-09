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

  const perfilRequestOptNulos = { ...perfilRequest, foto: null, biografia: null };

  const perfilRequestOptVazios = { ...perfilRequest, foto: '', biografia: '' };

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

  test('Case 1: Cria Recrutador apenas campos obrigatórios (Opcionais Nulos)', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(mockRecrutadorResponse);

    const actual = await recrutadorService.create({ ...recrutadorRequest, perfil: perfilRequestOptNulos });

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

  test('Case 2: Cria Recrutador apenas campos obrigatórios (Opcionais vazios)', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(mockRecrutadorResponse);

    const actual = await recrutadorService.create({ ...recrutadorRequest, perfil: perfilRequestOptVazios });

    expect(recrutadorRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cargo: 'PROFESSOR',
        perfil: expect.objectContaining({
          foto: '',
          biografia: '',
        }),
      }),
    );

    expect(actual).toEqual(expect.objectContaining(mockRecrutadorResponse));
  });

  test('Case 3: Cria Recrutador violando restrição da senha (Deve lançar erro)', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(mockRecrutadorResponse);

    await expect(
      recrutadorService.create({
        ...recrutadorRequest,
        perfil: { ...recrutadorRequest.perfil, senha: 'a' },
      }),
    ).rejects.toThrow();
  });

  test('Case 4: Recupera recrutador por id', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(mockRecrutadorResponse);
    (recrutadorRepository.getById as jest.Mock).mockResolvedValue(mockRecrutadorResponse);

    const actual = await recrutadorService.create(recrutadorRequest);
    const searched = await recrutadorService.getById(actual.id);
    expect(actual).toEqual(searched);
  });

  test('Case 5: Recupera recrutador por id inválido (Deve lançar erro)', async () => {
    (recrutadorRepository.getById as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(recrutadorService.getById(-999)).rejects.toThrow();
  });

  test('Case 6: Recupera todos os recrutadores (Quando há)', async () => {
    (recrutadorRepository.getAll as jest.Mock).mockResolvedValue([mockRecrutadorResponse]);

    const actual = await recrutadorService.getAll();

    expect(actual).toEqual([expect.objectContaining(mockRecrutadorResponse)]);
  });

  test('Case 6: Recupera todos os recrutadores (Quando não há - deve retornar lista vazia)', async () => {
    (recrutadorRepository.getAll as jest.Mock).mockResolvedValue([]);

    const actual = await recrutadorService.getAll();

    expect(actual).toEqual([]);
  });
});
