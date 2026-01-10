import { recrutadorService } from '../../src/services/RecrutadorService';
import { recrutadorRepository } from '../../src/repositories/RecrutadorRepository';
import { RecrutadorUpdateDTO } from '../../src/models/RecrutadorSchema';

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

  const recrutadorResponse = {
    id: 1,
    cargo: recrutadorRequest.cargo,
    instituicao: recrutadorRequest.instituicao,
    areaAtuacao: recrutadorRequest.areaAtuacao,
    laboratorios: 'LSI',
    perfil: pefilResponse,
  };

  test('Case 0: Cria um Recrutador com todos os campos preenchidos.', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(recrutadorResponse);

    const actual = await recrutadorService.create(recrutadorRequest);

    expect(recrutadorRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cargo: 'PROFESSOR',
        perfil: expect.objectContaining({
          tipo: 'RECRUTADOR',
        }),
      }),
    );

    expect(actual).toEqual(expect.objectContaining(recrutadorResponse));
    expect(actual.perfil).not.toHaveProperty('senha');
  });

  test('Case 1: Cria Recrutador apenas campos obrigatórios (Opcionais Nulos)', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(recrutadorResponse);

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

    expect(actual).toEqual(expect.objectContaining(recrutadorResponse));
    expect(actual.perfil).not.toHaveProperty('senha');
  });

  test('Case 2: Cria Recrutador apenas campos obrigatórios (Opcionais vazios)', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(recrutadorResponse);

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

    expect(actual).toEqual(expect.objectContaining(recrutadorResponse));
  });

  test('Case 3: Cria Recrutador violando restrição da senha (Deve lançar erro)', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(recrutadorResponse);

    await expect(
      recrutadorService.create({
        ...recrutadorRequest,
        perfil: { ...recrutadorRequest.perfil, senha: 'a' },
      }),
    ).rejects.toThrow();
  });

  test('Case 4: Recupera recrutador por id', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(recrutadorResponse);
    (recrutadorRepository.getById as jest.Mock).mockResolvedValue(recrutadorResponse);

    const actual = await recrutadorService.create(recrutadorRequest);
    const searched = await recrutadorService.getById(actual.id);
    expect(actual).toEqual(searched);
  });

  test('Case 5: Atualiza recrutador id e dados válidos', async () => {
    const updatedRecrutadorResponse = {
      ...recrutadorResponse,
      cargo: 'PESQUISADOR' as const,
      instituicao: 'UFRN',
    };

    (recrutadorRepository.create as jest.Mock).mockResolvedValue(recrutadorResponse);
    (recrutadorRepository.update as jest.Mock).mockResolvedValue(updatedRecrutadorResponse);

    const actual = await recrutadorService.create(recrutadorRequest);

    const updatedData: RecrutadorUpdateDTO = {
      cargo: 'PESQUISADOR' as const,
      instituicao: 'UFRN',
      areaAtuacao: recrutadorRequest.areaAtuacao,
      laboratorios: recrutadorRequest.laboratorios,
      perfil: recrutadorRequest.perfil,
    };

    const updated = await recrutadorService.update(actual.id, updatedData);

    expect(recrutadorRepository.update).toHaveBeenCalledWith(
      actual.id,
      expect.objectContaining({
        cargo: 'PESQUISADOR' as const,
        instituicao: 'UFRN',
      }),
    );

    expect(updated).toEqual(expect.objectContaining(updatedRecrutadorResponse));
  });

  test('Case 6: Atualiza recrutador por id inválido (Deve lançar erro)', async () => {
    (recrutadorRepository.update as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    const updatedData: RecrutadorUpdateDTO = {
      cargo: 'PESQUISADOR' as const,
      instituicao: 'UFRN',
      areaAtuacao: recrutadorRequest.areaAtuacao,
      laboratorios: recrutadorRequest.laboratorios,
      perfil: recrutadorRequest.perfil,
    };

    await expect(recrutadorService.update(-1, updatedData)).rejects.toThrow();
  });

  test('Case 7: Atualiza recrutador removendo opcionais', async () => {
    const updatedRecrutadorResponse = {
      ...recrutadorResponse,
      perfil: {
        ...recrutadorResponse.perfil,
        foto: null,
        biografia: null,
      },
    };

    (recrutadorRepository.create as jest.Mock).mockResolvedValue(recrutadorResponse);
    (recrutadorRepository.update as jest.Mock).mockResolvedValue(updatedRecrutadorResponse);

    const actual = await recrutadorService.create(recrutadorRequest);

    const updatedData: RecrutadorUpdateDTO = {
      cargo: recrutadorRequest.cargo,
      instituicao: recrutadorRequest.instituicao,
      areaAtuacao: recrutadorRequest.areaAtuacao,
      laboratorios: recrutadorRequest.laboratorios,
      perfil: perfilRequestOptNulos,
    };

    const updated = await recrutadorService.update(actual.id, updatedData);

    expect(recrutadorRepository.update).toHaveBeenCalledWith(
      actual.id,
      expect.objectContaining({
        perfil: expect.not.objectContaining({
          foto: expect.anything(),
          biografia: expect.anything(),
        }),
      }),
    );

    expect(updated).toEqual(expect.objectContaining(updatedRecrutadorResponse));
  });

  test('Case 8: Recupera recrutador por id inválido (Deve lançar erro)', async () => {
    (recrutadorRepository.getById as jest.Mock).mockRejectedValue(new Error('Entidade com id -1 não encontrada'));

    await expect(recrutadorService.getById(-999)).rejects.toThrow();
  });

  test('Case 9: Recupera todos os recrutadores (Quando há)', async () => {
    (recrutadorRepository.getAll as jest.Mock).mockResolvedValue([recrutadorResponse]);

    const actual = await recrutadorService.getAll();

    expect(actual).toEqual([expect.objectContaining(recrutadorResponse)]);
  });

  test('Case 10: Recupera todos os recrutadores (Quando não há - deve retornar lista vazia)', async () => {
    (recrutadorRepository.getAll as jest.Mock).mockResolvedValue([]);

    const actual = await recrutadorService.getAll();

    expect(actual).toEqual([]);
  });

  test('Case 11: Deleta recrutador por id', async () => {
    (recrutadorRepository.create as jest.Mock).mockResolvedValue(recrutadorResponse);
    (recrutadorRepository.getById as jest.Mock).mockResolvedValue(recrutadorResponse);
    (recrutadorRepository.delete as jest.Mock).mockResolvedValue(undefined);

    const actual = await recrutadorService.create(recrutadorRequest);

    await recrutadorService.delete(actual.id);

    expect(recrutadorRepository.getById).toHaveBeenCalledWith(actual.id);
    expect(recrutadorRepository.delete).toHaveBeenCalledWith(actual.id);
  });

  test('Case 12: Deleta recrutador por id inválido (Deve lançar erro)', async () => {
    (recrutadorRepository.delete as jest.Mock).mockRejectedValue(new Error('Entidade com id -999 não encontrada'));

    await expect(recrutadorService.delete(-999)).rejects.toThrow();
  });
});
