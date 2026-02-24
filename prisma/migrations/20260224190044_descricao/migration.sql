/*
  Warnings:

  - Added the required column `descricao` to the `Recomendacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recomendacao" ADD COLUMN     "descricao" TEXT NOT NULL;
