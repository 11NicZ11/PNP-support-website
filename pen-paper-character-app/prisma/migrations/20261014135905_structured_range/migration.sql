/*
  Warnings:

  - You are about to drop the column `range` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `range` on the `InventoryItem` table. All the data in the column will be lost.

*/
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
    "magicBonus" INTEGER DEFAULT 0,
    "attackBonus" INTEGER DEFAULT 0,
    "damageDice" TEXT,
    "damageType" TEXT,
    "rangeType" TEXT,
    "rangeValue" REAL,
    "rangeMaxValue" REAL,
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
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "damageImmunities" TEXT NOT NULL DEFAULT '[]',
    "damageResistances" TEXT NOT NULL DEFAULT '[]',
    "conditionImmunities" TEXT NOT NULL DEFAULT '[]',
    "characterId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Equipment_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipment" ("armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "conditionImmunities", "costAmount", "costUnit", "createdAt", "damageDice", "damageImmunities", "damageResistances", "damageType", "description", "equipped", "id", "libraryEntryId", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "shieldBonus", "sourceReference", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "weaponProperties", "weight") SELECT "armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "conditionImmunities", "costAmount", "costUnit", "createdAt", "damageDice", "damageImmunities", "damageResistances", "damageType", "description", "equipped", "id", "libraryEntryId", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "shieldBonus", "sourceReference", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "weaponProperties", "weight" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE INDEX "Equipment_characterId_idx" ON "Equipment"("characterId");
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");
CREATE INDEX "Equipment_equipped_idx" ON "Equipment"("equipped");
CREATE INDEX "Equipment_attuned_idx" ON "Equipment"("attuned");
CREATE INDEX "Equipment_libraryEntryId_idx" ON "Equipment"("libraryEntryId");
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" REAL,
    "value" INTEGER,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "equipmentId" TEXT,
    "containerId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "type" TEXT,
    "subtype" TEXT,
    "magicBonus" INTEGER DEFAULT 0,
    "attackBonus" INTEGER DEFAULT 0,
    "damageDice" TEXT,
    "damageType" TEXT,
    "rangeType" TEXT,
    "rangeValue" REAL,
    "rangeMaxValue" REAL,
    "weaponProperties" TEXT,
    "armorClassBonus" INTEGER DEFAULT 0,
    "armorType" TEXT,
    "maxDexBonus" INTEGER DEFAULT 0,
    "stealthDisadvantage" BOOLEAN NOT NULL DEFAULT false,
    "strengthRequirement" INTEGER DEFAULT 0,
    "shieldBonus" INTEGER DEFAULT 0,
    "attunement" BOOLEAN NOT NULL DEFAULT false,
    "attuned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "libraryEntryId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "InventoryContainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "containerId", "createdAt", "damageDice", "damageType", "description", "equipmentId", "equipped", "id", "libraryEntryId", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "shieldBonus", "sourceReference", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "value", "weaponProperties", "weight") SELECT "armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "containerId", "createdAt", "damageDice", "damageType", "description", "equipmentId", "equipped", "id", "libraryEntryId", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "shieldBonus", "sourceReference", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "value", "weaponProperties", "weight" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE INDEX "InventoryItem_containerId_idx" ON "InventoryItem"("containerId");
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");
CREATE INDEX "InventoryItem_equipped_idx" ON "InventoryItem"("equipped");
CREATE INDEX "InventoryItem_equipmentId_idx" ON "InventoryItem"("equipmentId");
CREATE INDEX "InventoryItem_type_idx" ON "InventoryItem"("type");
CREATE INDEX "InventoryItem_libraryEntryId_idx" ON "InventoryItem"("libraryEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
