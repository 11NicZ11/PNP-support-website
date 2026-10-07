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
    "classProgression" TEXT NOT NULL DEFAULT 'normal',
    "nextLevelExp" INTEGER NOT NULL DEFAULT 300,
    "expMode" TEXT NOT NULL DEFAULT 'next_only',
    "expThresholds" TEXT NOT NULL DEFAULT '{}',
    "hasHitDice" BOOLEAN NOT NULL DEFAULT true,
    "hitDiceMode" TEXT NOT NULL DEFAULT 'scaled',
    "attributeMethod" TEXT NOT NULL DEFAULT 'free',
    "attributeMethodState" TEXT NOT NULL DEFAULT '{}',
    "notesCategories" TEXT NOT NULL DEFAULT '[]',
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHpMax" INTEGER NOT NULL DEFAULT 0,
    "exhaustionLevel" INTEGER NOT NULL DEFAULT 0,
    "lastShortRest" DATETIME,
    "lastLongRest" DATETIME
);
INSERT INTO "new_Character" ("alignment", "attributeMethod", "attributeMethodState", "class", "classProgression", "createdAt", "currentHp", "exhaustionLevel", "experience", "id", "lastLongRest", "lastShortRest", "level", "levelingMode", "name", "nextLevelExp", "notes", "notesCategories", "race", "tempHp", "tempMaxHp", "tempMaxHpMax", "unitSystem", "updatedAt") SELECT "alignment", "attributeMethod", "attributeMethodState", "class", "classProgression", "createdAt", "currentHp", "exhaustionLevel", "experience", "id", "lastLongRest", "lastShortRest", "level", "levelingMode", "name", "nextLevelExp", "notes", "notesCategories", "race", "tempHp", "tempMaxHp", "tempMaxHpMax", "unitSystem", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_name_idx" ON "Character"("name");
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
CREATE TABLE "new_CharacterClassLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "subclass" TEXT,
    "subclassLevel" INTEGER,
    "level" INTEGER NOT NULL,
    "hitDie" TEXT NOT NULL DEFAULT 'd8',
    "features" TEXT NOT NULL DEFAULT '[]',
    "spellcastingAbility" TEXT NOT NULL DEFAULT 'none',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "leftAtLevel" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "track" INTEGER NOT NULL DEFAULT 0,
    "savingThrowProficiencies" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterClassLevel_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CharacterClassLevel" ("characterId", "className", "createdAt", "features", "hitDie", "id", "isActive", "leftAtLevel", "level", "notes", "sourceReference", "spellcastingAbility", "subclass", "subclassLevel", "updatedAt") SELECT "characterId", "className", "createdAt", "features", "hitDie", "id", "isActive", "leftAtLevel", "level", "notes", "sourceReference", "spellcastingAbility", "subclass", "subclassLevel", "updatedAt" FROM "CharacterClassLevel";
DROP TABLE "CharacterClassLevel";
ALTER TABLE "new_CharacterClassLevel" RENAME TO "CharacterClassLevel";
CREATE INDEX "CharacterClassLevel_characterId_className_idx" ON "CharacterClassLevel"("characterId", "className");
CREATE INDEX "CharacterClassLevel_characterId_isActive_idx" ON "CharacterClassLevel"("characterId", "isActive");
CREATE INDEX "CharacterClassLevel_characterId_track_idx" ON "CharacterClassLevel"("characterId", "track");
CREATE UNIQUE INDEX "CharacterClassLevel_characterId_className_level_track_key" ON "CharacterClassLevel"("characterId", "className", "level", "track");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
