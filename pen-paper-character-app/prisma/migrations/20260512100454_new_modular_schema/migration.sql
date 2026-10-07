/*
  Warnings:

  - You are about to drop the column `attributes` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `combat` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `savingThrows` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Defense` table. All the data in the column will be lost.
  - You are about to drop the column `isPermanent` on the `Defense` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "HpSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HpSource_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "description" TEXT,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" REAL,
    "costAmount" INTEGER,
    "costUnit" TEXT,
    "attackBonus" INTEGER DEFAULT 0,
    "damageDice" TEXT,
    "damageType" TEXT,
    "armorClassBonus" INTEGER DEFAULT 0,
    "properties" TEXT,
    "attunement" BOOLEAN NOT NULL DEFAULT false,
    "attuned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Spell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "school" TEXT,
    "castingTime" TEXT,
    "range" TEXT,
    "components" TEXT,
    "duration" TEXT,
    "description" TEXT,
    "higherLevels" TEXT,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "ritual" BOOLEAN NOT NULL DEFAULT false,
    "prepared" BOOLEAN NOT NULL DEFAULT false,
    "alwaysPrepared" BOOLEAN NOT NULL DEFAULT false,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Spell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PredefinedStatusEffect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '⚠️',
    "defaultDuration" INTEGER,
    "durationUnit" TEXT NOT NULL DEFAULT 'rounds',
    "immunityKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    "strength" INTEGER NOT NULL DEFAULT 10,
    "dexterity" INTEGER NOT NULL DEFAULT 10,
    "constitution" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "wisdom" INTEGER NOT NULL DEFAULT 10,
    "charisma" INTEGER NOT NULL DEFAULT 10,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "initiativeBonus" INTEGER NOT NULL DEFAULT 0,
    "proficiencyBonus" INTEGER NOT NULL DEFAULT 2,
    "proficiencyBonusName" TEXT NOT NULL DEFAULT 'Übungsbonus',
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHpMax" INTEGER NOT NULL DEFAULT 0,
    "savingThrowStrength" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowDexterity" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowConstitution" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowIntelligence" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowWisdom" BOOLEAN NOT NULL DEFAULT false,
    "savingThrowCharisma" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "backgroundName" TEXT NOT NULL DEFAULT '',
    "backgroundTraits" TEXT NOT NULL DEFAULT '',
    "backgroundIdeals" TEXT NOT NULL DEFAULT '',
    "backgroundBonds" TEXT NOT NULL DEFAULT '',
    "backgroundFlaws" TEXT NOT NULL DEFAULT '',
    "backgroundFeatures" TEXT NOT NULL DEFAULT '',
    "backgroundBonusSkills" TEXT NOT NULL DEFAULT '[]',
    "backgroundBonusLanguages" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Character" ("alignment", "backgroundBonds", "backgroundBonusLanguages", "backgroundBonusSkills", "backgroundFeatures", "backgroundFlaws", "backgroundIdeals", "backgroundName", "backgroundTraits", "class", "createdAt", "experience", "id", "level", "name", "notes", "race", "updatedAt") SELECT "alignment", "backgroundBonds", "backgroundBonusLanguages", "backgroundBonusSkills", "backgroundFeatures", "backgroundFlaws", "backgroundIdeals", "backgroundName", "backgroundTraits", "class", "createdAt", "experience", "id", "level", "name", "notes", "race", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_name_idx" ON "Character"("name");
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
CREATE TABLE "new_Defense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "sourceName" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Defense_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Defense" ("characterId", "createdAt", "description", "id", "name", "source", "sourceName", "type") SELECT "characterId", "createdAt", "description", "id", "name", "source", "sourceName", "type" FROM "Defense";
DROP TABLE "Defense";
ALTER TABLE "new_Defense" RENAME TO "Defense";
CREATE INDEX "Defense_characterId_idx" ON "Defense"("characterId");
CREATE INDEX "Defense_type_idx" ON "Defense"("type");
CREATE UNIQUE INDEX "Defense_characterId_type_name_key" ON "Defense"("characterId", "type", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "HpSource_characterId_idx" ON "HpSource"("characterId");

-- CreateIndex
CREATE INDEX "Equipment_characterId_idx" ON "Equipment"("characterId");

-- CreateIndex
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");

-- CreateIndex
CREATE INDEX "Equipment_equipped_idx" ON "Equipment"("equipped");

-- CreateIndex
CREATE INDEX "Spell_characterId_idx" ON "Spell"("characterId");

-- CreateIndex
CREATE INDEX "Spell_level_idx" ON "Spell"("level");

-- CreateIndex
CREATE INDEX "Spell_prepared_idx" ON "Spell"("prepared");

-- CreateIndex
CREATE UNIQUE INDEX "PredefinedStatusEffect_name_key" ON "PredefinedStatusEffect"("name");
