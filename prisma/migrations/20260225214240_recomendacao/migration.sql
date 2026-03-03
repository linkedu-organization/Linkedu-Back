-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "TipoRecomendacao" AS ENUM ('VAGAS_PARA_CANDIDATO', 'CANDIDATOS_PARA_VAGA');

-- AlterTable
ALTER TABLE "Candidato" ADD COLUMN     "embedding" vector(3072);

-- AlterTable
ALTER TABLE "Vaga" ADD COLUMN     "embedding" vector(3072);

-- CreateTable
CREATE TABLE "Recomendacao" (
    "vagaId" INTEGER NOT NULL,
    "candidatoId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoRecomendacao" NOT NULL,

    CONSTRAINT "Recomendacao_pkey" PRIMARY KEY ("vagaId","candidatoId","tipo")
);

-- AddForeignKey
ALTER TABLE "Recomendacao" ADD CONSTRAINT "Recomendacao_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacao" ADD CONSTRAINT "Recomendacao_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
