-- CreateEnum
CREATE TYPE "CargoCandidato" AS ENUM ('ALUNO', 'TECNICO');

-- CreateEnum
CREATE TYPE "NivelEscolaridade" AS ENUM ('FUNDAMENTAL_INCOMPLETO', 'FUNDAMENTAL_COMPLETO', 'MEDIO_INCOMPLETO', 'MEDIO_COMPLETO', 'SUPERIOR_INCOMPLETO', 'SUPERIOR_COMPLETO', 'POS_GRADUACAO');

-- CreateEnum
CREATE TYPE "CargaHoraria" AS ENUM ('ATE_10H', 'DE_10_A_20H', 'DE_20_A_30H', 'ACIMA_DE_30H');

-- CreateTable
CREATE TABLE "Candidato" (
    "id" SERIAL NOT NULL,
    "perfil_id" INTEGER NOT NULL,
    "cargo" "CargoCandidato" NOT NULL,
    "instituicao" TEXT NOT NULL,
    "areaAtuacao" TEXT NOT NULL,
    "nivelEscolaridade" "NivelEscolaridade" NOT NULL,
    "periodoIngresso" TEXT,
    "periodoConclusao" TEXT,
    "disponivel" BOOLEAN NOT NULL,
    "tempoDisponivel" "CargaHoraria" NOT NULL,
    "lattes" TEXT,
    "linkedin" TEXT,
    "areasInteresse" TEXT[],
    "habilidades" TEXT[],

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidato_perfil_id_key" ON "Candidato"("perfil_id");

-- AddForeignKey
ALTER TABLE "Candidato" ADD CONSTRAINT "Candidato_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
