-- CreateEnum
CREATE TYPE "TipoRecomendacao" AS ENUM ('VAGAS_PARA_CANDIDATO', 'CANDIDATOS_PARA_VAGA');

-- CreateTable
CREATE TABLE "Recomendacao" (
    "vagaId" INTEGER NOT NULL,
    "candidatoId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoRecomendacao" NOT NULL,

    CONSTRAINT "Recomendacao_pkey" PRIMARY KEY ("vagaId","candidatoId")
);

-- AddForeignKey
ALTER TABLE "Recomendacao" ADD CONSTRAINT "Recomendacao_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacao" ADD CONSTRAINT "Recomendacao_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
