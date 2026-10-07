/*
  Warnings:

  - You are about to drop the column `properties` on the `Equipment` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Spell` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "attackBonus" INTEGER,
    "damageDice" TEXT,
    "damageType" TEXT,
    "range" TEXT,
    "areaOfEffect" TEXT,
    "usesPerDay" INTEGER,
    "usesRemaining" INTEGER,
    "rechargeOnShortRest" BOOLEAN NOT NULL DEFAULT false,
    "rechargeOnLongRest" BOOLEAN NOT NULL DEFAULT false,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Action_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipment" (
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
    "range" TEXT,
    "weaponProperties" TEXT,
    "armorClassBonus" INTEGER DEFAULT 0,
    "armorType" TEXT,
    "maxDexBonus" INTEGER,
    "stealthDisadvantage" BOOLEAN NOT NULL DEFAULT false,
    "strengthRequirement" INTEGER,
    "shieldBonus" INTEGER DEFAULT 2,
    "attunement" BOOLEAN NOT NULL DEFAULT false,
    "attuned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Equipment" ("armorClassBonus", "attackBonus", "attuned", "attunement", "characterId", "costAmount", "costUnit", "createdAt", "damageDice", "damageType", "description", "equipped", "id", "name", "notes", "quantity", "subtype", "type", "updatedAt", "weight") SELECT "armorClassBonus", "attackBonus", "attuned", "attunement", "characterId", "costAmount", "costUnit", "createdAt", "damageDice", "damageType", "description", "equipped", "id", "name", "notes", "quantity", "subtype", "type", "updatedAt", "weight" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE INDEX "Equipment_characterId_idx" ON "Equipment"("characterId");
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");
CREATE INDEX "Equipment_equipped_idx" ON "Equipment"("equipped");
CREATE INDEX "Equipment_attuned_idx" ON "Equipment"("attuned");
CREATE TABLE "new_Spell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "school" TEXT,
    "castingTime" TEXT,
    "range" TEXT,
    "components" TEXT,
    "materialComponent" TEXT,
    "duration" TEXT,
    "description" TEXT,
    "higherLevels" TEXT,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "ritual" BOOLEAN NOT NULL DEFAULT false,
    "prepared" BOOLEAN NOT NULL DEFAULT false,
    "alwaysPrepared" BOOLEAN NOT NULL DEFAULT false,
    "attackType" TEXT,
    "savingThrow" TEXT,
    "damageDice" TEXT,
    "damageType" TEXT,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Spell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Spell" ("alwaysPrepared", "castingTime", "characterId", "components", "concentration", "createdAt", "description", "duration", "higherLevels", "id", "level", "name", "prepared", "range", "ritual", "school") SELECT "alwaysPrepared", "castingTime", "characterId", "components", "concentration", "createdAt", "description", "duration", "higherLevels", "id", "level", "name", "prepared", "range", "ritual", "school" FROM "Spell";
DROP TABLE "Spell";
ALTER TABLE "new_Spell" RENAME TO "Spell";
CREATE INDEX "Spell_characterId_idx" ON "Spell"("characterId");
CREATE INDEX "Spell_level_idx" ON "Spell"("level");
CREATE INDEX "Spell_prepared_idx" ON "Spell"("prepared");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Action_characterId_idx" ON "Action"("characterId");

-- CreateIndex
CREATE INDEX "Action_type_idx" ON "Action"("type");

-- CreateIndex
CREATE INDEX "Action_sourceType_idx" ON "Action"("sourceType");
