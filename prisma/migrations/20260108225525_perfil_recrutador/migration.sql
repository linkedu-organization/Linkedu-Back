-- CreateEnum
CREATE TYPE "TipoPerfil" AS ENUM ('CANDIDATO', 'RECRUTADOR');

-- CreateEnum
CREATE TYPE "CargoRecrutador" AS ENUM ('TECNICO', 'PROFESSOR', 'PESQUISADOR');

-- CreateTable
CREATE TABLE "Perfil" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tipo" "TipoPerfil" NOT NULL,
    "senha" TEXT NOT NULL,
    "biografia" TEXT,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ultimoAcesso" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recrutador" (
    "id" SERIAL NOT NULL,
    "perfil_id" INTEGER NOT NULL,
    "cargo" "CargoRecrutador" NOT NULL,
    "instituicao" TEXT NOT NULL,
    "areaAtuacao" TEXT NOT NULL,
    "laboratorios" TEXT NOT NULL,

    CONSTRAINT "Recrutador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recrutador_perfil_id_key" ON "Recrutador"("perfil_id");

-- AddForeignKey
ALTER TABLE "Recrutador" ADD CONSTRAINT "Recrutador_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
