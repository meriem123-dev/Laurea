-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('solo', 'pair', 'trio', 'quad');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('deposited', 'validated', 'planned', 'defended', 'graded', 'closed');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" "Speciality" NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "academicYear" TEXT NOT NULL,
    "teamType" "TeamType" NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "coSupervisorId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "status" "ProjectStatus" NOT NULL DEFAULT 'deposited',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_coSupervisorId_fkey" FOREIGN KEY ("coSupervisorId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
