/*
  Warnings:

  - The primary key for the `Recomendacao` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Recomendacao" DROP CONSTRAINT "Recomendacao_pkey",
ADD CONSTRAINT "Recomendacao_pkey" PRIMARY KEY ("vagaId", "candidatoId", "tipo");
