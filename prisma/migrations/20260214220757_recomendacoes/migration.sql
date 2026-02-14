/*
  Warnings:

  - Added the required column `score` to the `Recomendacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidato" ADD COLUMN     "embedding" vector(1536);

-- AlterTable
ALTER TABLE "Recomendacao" ADD COLUMN     "score" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Vaga" ADD COLUMN     "embedding" vector(1536);
