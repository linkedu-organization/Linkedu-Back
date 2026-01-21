-- CreateEnum
CREATE TYPE "PublicoAlvo" AS ENUM ('GRADUACAO', 'POS_GRADUACAO', 'TECNICO', 'PESQUISADOR');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('PESQUISA', 'PESQUISA_E_DESENVOLVIMENTO', 'PESQUISA_DESENVOLVIMENTO_E_INOVACAO', 'ORGANIZACAO_DE_EVENTOS', 'EXTENSAO', 'MONITORIA', 'OUTROS');

-- CreateTable
CREATE TABLE "Vaga" (
    "id" SERIAL NOT NULL,
    "recrutadorId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "ehPublica" BOOLEAN NOT NULL,
    "ehRemunerada" BOOLEAN NOT NULL,
    "dataExpiracao" TEXT,
    "cargaHoraria" INTEGER NOT NULL,
    "duracao" TEXT,
    "instituicao" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "linkInscricao" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "publicoAlvo" "PublicoAlvo"[],
    "conhecimentosObrigatorios" TEXT[],
    "conhecimentosOpcionais" TEXT[],

    CONSTRAINT "Vaga_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vaga" ADD CONSTRAINT "Vaga_recrutadorId_fkey" FOREIGN KEY ("recrutadorId") REFERENCES "Recrutador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
