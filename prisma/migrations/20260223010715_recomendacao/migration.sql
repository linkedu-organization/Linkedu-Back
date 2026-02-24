/*
  Warnings:

  - You are about to drop the column `perfil_id` on the `Candidato` table. All the data in the column will be lost.
  - You are about to drop the column `perfil_id` on the `Recrutador` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[perfilId]` on the table `Candidato` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[perfilId]` on the table `Recrutador` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `perfilId` to the `Candidato` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perfilId` to the `Recrutador` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "TipoRecomendacao" AS ENUM ('VAGAS_PARA_CANDIDATO', 'CANDIDATOS_PARA_VAGA');

-- DropForeignKey
ALTER TABLE "Candidato" DROP CONSTRAINT "Candidato_perfil_id_fkey";

-- DropForeignKey
ALTER TABLE "Recrutador" DROP CONSTRAINT "Recrutador_perfil_id_fkey";

-- DropIndex
DROP INDEX "Candidato_perfil_id_key";

-- DropIndex
DROP INDEX "Recrutador_perfil_id_key";

-- AlterTable
ALTER TABLE "Candidato" DROP COLUMN "perfil_id",
ADD COLUMN     "embedding" vector(3072),
ADD COLUMN     "perfilId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Recrutador" DROP COLUMN "perfil_id",
ADD COLUMN     "perfilId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vaga" ADD COLUMN     "embedding" vector(3072);

-- CreateTable
CREATE TABLE "Experiencia" (
    "id" SERIAL NOT NULL,
    "candidatoId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "orientador" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "periodoInicio" TEXT NOT NULL,
    "periodoFim" TEXT,
    "local" TEXT,

    CONSTRAINT "Experiencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recomendacao" (
    "vagaId" INTEGER NOT NULL,
    "candidatoId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoRecomendacao" NOT NULL,

    CONSTRAINT "Recomendacao_pkey" PRIMARY KEY ("vagaId","candidatoId","tipo")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidato_perfilId_key" ON "Candidato"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "Recrutador_perfilId_key" ON "Recrutador"("perfilId");

-- AddForeignKey
ALTER TABLE "Recrutador" ADD CONSTRAINT "Recrutador_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidato" ADD CONSTRAINT "Candidato_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiencia" ADD CONSTRAINT "Experiencia_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacao" ADD CONSTRAINT "Recomendacao_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacao" ADD CONSTRAINT "Recomendacao_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
