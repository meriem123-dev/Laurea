-- CreateEnum
CREATE TYPE "Speciality" AS ENUM ('RESEAUX_SEC', 'DATA_SCIENCE', 'GENIE_LOGICIEL', 'INTELLIGENCE_ARTIFICIELLE', 'SYSTEMES_INFORMATION');

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "speciality" "Speciality" NOT NULL,
    "group" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_matricule_key" ON "Student"("matricule");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
