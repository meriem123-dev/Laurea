-- CreateEnum
CREATE TYPE "JuryResponse" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "Defense" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "roomId" TEXT NOT NULL,
    "presidentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Defense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefenseMember" (
    "defenseId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "DefenseMember_pkey" PRIMARY KEY ("defenseId","teacherId")
);

-- CreateTable
CREATE TABLE "JuryConfirmation" (
    "defenseId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" "JuryResponse" NOT NULL DEFAULT 'PENDING',
    "tokenHash" TEXT NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "JuryConfirmation_pkey" PRIMARY KEY ("defenseId","teacherId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Defense_projectId_key" ON "Defense"("projectId");

-- CreateIndex
CREATE INDEX "Defense_date_idx" ON "Defense"("date");

-- CreateIndex
CREATE UNIQUE INDEX "JuryConfirmation_tokenHash_key" ON "JuryConfirmation"("tokenHash");

-- AddForeignKey
ALTER TABLE "Defense" ADD CONSTRAINT "Defense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defense" ADD CONSTRAINT "Defense_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defense" ADD CONSTRAINT "Defense_presidentId_fkey" FOREIGN KEY ("presidentId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseMember" ADD CONSTRAINT "DefenseMember_defenseId_fkey" FOREIGN KEY ("defenseId") REFERENCES "Defense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseMember" ADD CONSTRAINT "DefenseMember_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuryConfirmation" ADD CONSTRAINT "JuryConfirmation_defenseId_fkey" FOREIGN KEY ("defenseId") REFERENCES "Defense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuryConfirmation" ADD CONSTRAINT "JuryConfirmation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
