-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "block" TEXT NOT NULL DEFAULT '',
    "pole" TEXT NOT NULL DEFAULT '',
    "equipment" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'blue',

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");
