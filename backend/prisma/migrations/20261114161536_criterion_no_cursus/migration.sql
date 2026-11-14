/*
  Warnings:

  - You are about to drop the column `cursus` on the `Criterion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Criterion` will be added. If there are existing duplicate values, this will fail.

*/

DELETE FROM "DefenseScore" WHERE "criterionId" IN (SELECT "id" FROM "Criterion" WHERE "cursus" = 'INGENIEUR');
DELETE FROM "Criterion" WHERE "cursus" = 'INGENIEUR';

-- DropIndex
DROP INDEX "Criterion_cursus_key_key";

-- AlterTable
ALTER TABLE "Criterion" DROP COLUMN "cursus";

-- CreateIndex
CREATE UNIQUE INDEX "Criterion_key_key" ON "Criterion"("key");
