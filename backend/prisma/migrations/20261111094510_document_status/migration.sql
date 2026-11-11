-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'EVALUATED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "evaluatedAt" TIMESTAMP(3),
ADD COLUMN     "evaluatedById" TEXT,
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_evaluatedById_fkey" FOREIGN KEY ("evaluatedById") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
UPDATE "Document" SET "status" = 'EVALUATED', "evaluatedAt" = "createdAt" WHERE "grade" IS NOT NULL;