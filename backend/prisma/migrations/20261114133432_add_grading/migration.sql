-- CreateTable
CREATE TABLE "Criterion" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "cursus" "Cursus" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coefficient" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefenseScore" (
    "defenseId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DefenseScore_pkey" PRIMARY KEY ("defenseId","teacherId","criterionId")
);

-- CreateTable
CREATE TABLE "DefenseEvaluation" (
    "defenseId" INTEGER NOT NULL,
    "finalGrade" DOUBLE PRECISION,
    "justification" TEXT NOT NULL DEFAULT '',
    "observations" TEXT NOT NULL DEFAULT '',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,

    CONSTRAINT "DefenseEvaluation_pkey" PRIMARY KEY ("defenseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Criterion_cursus_key_key" ON "Criterion"("cursus", "key");

-- AddForeignKey
ALTER TABLE "DefenseScore" ADD CONSTRAINT "DefenseScore_defenseId_fkey" FOREIGN KEY ("defenseId") REFERENCES "Defense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseScore" ADD CONSTRAINT "DefenseScore_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseScore" ADD CONSTRAINT "DefenseScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefenseEvaluation" ADD CONSTRAINT "DefenseEvaluation_defenseId_fkey" FOREIGN KEY ("defenseId") REFERENCES "Defense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
