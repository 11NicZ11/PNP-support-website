-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL DEFAULT 'Mittel',
    "speed" INTEGER NOT NULL DEFAULT 30,
    "description" TEXT NOT NULL DEFAULT '',
    "languages" TEXT NOT NULL DEFAULT '[]',
    "traits" TEXT NOT NULL DEFAULT '[]',
    "abilityScoreIncrease" TEXT NOT NULL DEFAULT '{}',
    "subraces" TEXT NOT NULL DEFAULT '[]',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Race_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Race_characterId_key" ON "Race"("characterId");
