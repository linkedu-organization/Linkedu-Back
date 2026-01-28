-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "embedding" vector,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
