jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
    recrutador: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    candidato: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    perfil: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    recomendacao: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    TipoPerfil: {
      RECRUTADOR: 'RECRUTADOR',
      CANDIDATO: 'CANDIDATO',
    },
    TipoRecomendacao: {
      VAGA: 'VAGAS_PARA_CANDIDATO',
      CANDIDATO: 'CANDIDATOS_PARA_VAGA',
    },
  };
});

beforeEach(() => {
  jest.restoreAllMocks();
});
