-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Race" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sizeCategory" TEXT NOT NULL DEFAULT 'Mittel',
    "size" TEXT NOT NULL DEFAULT 'Mittel',
    "height" TEXT NOT NULL DEFAULT '',
    "weight" TEXT NOT NULL DEFAULT '',
    "age" TEXT NOT NULL DEFAULT '',
    "speed" INTEGER NOT NULL DEFAULT 30,
    "description" TEXT NOT NULL DEFAULT '',
    "languages" TEXT NOT NULL DEFAULT '[]',
    "traits" TEXT NOT NULL DEFAULT '[]',
    "abilityScoreIncrease" TEXT NOT NULL DEFAULT '{"type":"standard","bonuses":{}}',
    "subraces" TEXT NOT NULL DEFAULT '[]',
    "skillProficiencies" TEXT NOT NULL DEFAULT '[]',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Race_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Race" ("abilityScoreIncrease", "characterId", "createdAt", "description", "id", "languages", "name", "size", "speed", "subraces", "traits", "updatedAt") SELECT "abilityScoreIncrease", "characterId", "createdAt", "description", "id", "languages", "name", "size", "speed", "subraces", "traits", "updatedAt" FROM "Race";
DROP TABLE "Race";
ALTER TABLE "new_Race" RENAME TO "Race";
CREATE UNIQUE INDEX "Race_characterId_key" ON "Race"("characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
