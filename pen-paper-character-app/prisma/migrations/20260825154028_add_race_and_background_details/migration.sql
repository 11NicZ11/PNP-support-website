-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Background" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "traits" TEXT NOT NULL DEFAULT '',
    "ideals" TEXT NOT NULL DEFAULT '',
    "bonds" TEXT NOT NULL DEFAULT '',
    "flaws" TEXT NOT NULL DEFAULT '',
    "features" TEXT NOT NULL DEFAULT '',
    "bonusSkills" TEXT NOT NULL DEFAULT '[]',
    "bonusLanguages" TEXT NOT NULL DEFAULT '[]',
    "allies" TEXT NOT NULL DEFAULT '',
    "organizations" TEXT NOT NULL DEFAULT '',
    "abilityScoreIncrease" TEXT NOT NULL DEFAULT '{"type":"standard","bonuses":{}}',
    "toolProficiencies" TEXT NOT NULL DEFAULT '[]',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Background_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Background" ("bonds", "bonusLanguages", "bonusSkills", "characterId", "createdAt", "features", "flaws", "id", "ideals", "name", "traits", "updatedAt") SELECT "bonds", "bonusLanguages", "bonusSkills", "characterId", "createdAt", "features", "flaws", "id", "ideals", "name", "traits", "updatedAt" FROM "Background";
DROP TABLE "Background";
ALTER TABLE "new_Background" RENAME TO "Background";
CREATE UNIQUE INDEX "Background_characterId_key" ON "Background"("characterId");
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
    "alignment" TEXT NOT NULL DEFAULT '',
    "faith" TEXT NOT NULL DEFAULT '',
    "personality" TEXT NOT NULL DEFAULT '',
    "bonds" TEXT NOT NULL DEFAULT '',
    "ideals" TEXT NOT NULL DEFAULT '',
    "flaws" TEXT NOT NULL DEFAULT '',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Race_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Race" ("abilityScoreIncrease", "age", "characterId", "createdAt", "description", "height", "id", "languages", "name", "size", "sizeCategory", "skillProficiencies", "speed", "subraces", "traits", "updatedAt", "weight") SELECT "abilityScoreIncrease", "age", "characterId", "createdAt", "description", "height", "id", "languages", "name", "size", "sizeCategory", "skillProficiencies", "speed", "subraces", "traits", "updatedAt", "weight" FROM "Race";
DROP TABLE "Race";
ALTER TABLE "new_Race" RENAME TO "Race";
CREATE UNIQUE INDEX "Race_characterId_key" ON "Race"("characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
