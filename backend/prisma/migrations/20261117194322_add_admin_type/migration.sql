-- CreateEnum
CREATE TYPE "AdminType" AS ENUM ('DEPARTMENT_HEAD', 'ADMINISTRATION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminType" "AdminType";
