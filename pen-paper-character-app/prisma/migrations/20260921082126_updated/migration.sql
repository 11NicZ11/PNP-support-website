-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "alignment" TEXT NOT NULL DEFAULT '',
    "experience" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "levelingMode" TEXT NOT NULL DEFAULT 'milestone',
    "unitSystem" TEXT NOT NULL DEFAULT 'metric',
    "classProgression" TEXT NOT NULL DEFAULT 'single',
    "nextLevelExp" INTEGER NOT NULL DEFAULT 300,
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHpMax" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Character" ("alignment", "class", "createdAt", "currentHp", "experience", "id", "level", "name", "notes", "race", "tempHp", "tempMaxHp", "tempMaxHpMax", "updatedAt") SELECT "alignment", "class", "createdAt", "currentHp", "experience", "id", "level", "name", "notes", "race", "tempHp", "tempMaxHp", "tempMaxHpMax", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_name_idx" ON "Character"("name");
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
CREATE TABLE "new_HpSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'manual',
    "sourceName" TEXT NOT NULL DEFAULT '',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HpSource_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HpSource" ("characterId", "createdAt", "id", "name", "value") SELECT "characterId", "createdAt", "id", "name", "value" FROM "HpSource";
DROP TABLE "HpSource";
ALTER TABLE "new_HpSource" RENAME TO "HpSource";
CREATE INDEX "HpSource_characterId_idx" ON "HpSource"("characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
