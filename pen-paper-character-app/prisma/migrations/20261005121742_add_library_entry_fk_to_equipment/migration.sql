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
INSERT INTO "new_Equipment" ("armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "conditionImmunities", "costAmount", "costUnit", "createdAt", "damageDice", "damageImmunities", "damageResistances", "damageType", "description", "equipped", "id", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "range", "shieldBonus", "sourceReference", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "weaponProperties", "weight") SELECT "armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "conditionImmunities", "costAmount", "costUnit", "createdAt", "damageDice", "damageImmunities", "damageResistances", "damageType", "description", "equipped", "id", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "range", "shieldBonus", "sourceReference", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "weaponProperties", "weight" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE INDEX "Equipment_characterId_idx" ON "Equipment"("characterId");
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");
CREATE INDEX "Equipment_equipped_idx" ON "Equipment"("equipped");
CREATE INDEX "Equipment_attuned_idx" ON "Equipment"("attuned");
CREATE INDEX "Equipment_libraryEntryId_idx" ON "Equipment"("libraryEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
