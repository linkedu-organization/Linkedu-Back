/*
  Warnings:

  - Changed the type of `tempoDisponivel` on the `Candidato` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Candidato" DROP COLUMN "tempoDisponivel",
ADD COLUMN     "tempoDisponivel" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "CargaHoraria";
