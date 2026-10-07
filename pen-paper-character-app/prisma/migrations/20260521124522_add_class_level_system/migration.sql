/*
  Warnings:

  - You are about to drop the `ClassFeature` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClassFeature";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CharacterClassLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "subclass" TEXT,
    "level" INTEGER NOT NULL,
    "features" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterClassLevel_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CharacterClassLevel_characterId_className_idx" ON "CharacterClassLevel"("characterId", "className");

-- CreateIndex
CREATE INDEX "CharacterClassLevel_characterId_idx" ON "CharacterClassLevel"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterClassLevel_characterId_className_level_key" ON "CharacterClassLevel"("characterId", "className", "level");
