-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Defense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "sourceName" TEXT NOT NULL DEFAULT '',
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Defense_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Defense" ("characterId", "createdAt", "description", "id", "isCustom", "name", "source", "sourceName", "type") SELECT "characterId", "createdAt", "description", "id", "isCustom", "name", coalesce("source", 'manual') AS "source", coalesce("sourceName", '') AS "sourceName", "type" FROM "Defense";
DROP TABLE "Defense";
ALTER TABLE "new_Defense" RENAME TO "Defense";
CREATE INDEX "Defense_characterId_idx" ON "Defense"("characterId");
CREATE INDEX "Defense_type_idx" ON "Defense"("type");
CREATE INDEX "Defense_source_idx" ON "Defense"("source");
CREATE INDEX "Defense_characterId_source_sourceName_idx" ON "Defense"("characterId", "source", "sourceName");
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
    "damageImmunities" TEXT NOT NULL DEFAULT '[]',
    "damageResistances" TEXT NOT NULL DEFAULT '[]',
    "conditionImmunities" TEXT NOT NULL DEFAULT '[]',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Equipment" ("armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "costAmount", "costUnit", "createdAt", "damageDice", "damageType", "description", "equipped", "id", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "range", "shieldBonus", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "weaponProperties", "weight") SELECT "armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "costAmount", "costUnit", "createdAt", "damageDice", "damageType", "description", "equipped", "id", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "range", "shieldBonus", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "weaponProperties", "weight" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE INDEX "Equipment_characterId_idx" ON "Equipment"("characterId");
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");
CREATE INDEX "Equipment_equipped_idx" ON "Equipment"("equipped");
CREATE INDEX "Equipment_attuned_idx" ON "Equipment"("attuned");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
