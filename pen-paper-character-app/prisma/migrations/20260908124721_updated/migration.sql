-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryContainer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'container',
    "description" TEXT,
    "capacity" INTEGER,
    "weightLimit" REAL,
    "weightUnit" TEXT NOT NULL DEFAULT 'kg',
    "parentId" TEXT,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryContainer_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryContainer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "InventoryContainer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryContainer" ("capacity", "characterId", "createdAt", "description", "id", "name", "parentId", "type", "updatedAt", "weightLimit") SELECT "capacity", "characterId", "createdAt", "description", "id", "name", "parentId", "type", "updatedAt", "weightLimit" FROM "InventoryContainer";
DROP TABLE "InventoryContainer";
ALTER TABLE "new_InventoryContainer" RENAME TO "InventoryContainer";
CREATE INDEX "InventoryContainer_characterId_idx" ON "InventoryContainer"("characterId");
CREATE INDEX "InventoryContainer_parentId_idx" ON "InventoryContainer"("parentId");
CREATE INDEX "InventoryContainer_type_idx" ON "InventoryContainer"("type");
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" REAL,
    "value" INTEGER,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "equipmentId" TEXT,
    "containerId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "type" TEXT,
    "subtype" TEXT,
    "magicBonus" INTEGER DEFAULT 0,
    "attackBonus" INTEGER DEFAULT 0,
    "damageDice" TEXT,
    "damageType" TEXT,
    "range" TEXT,
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "InventoryContainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "containerId", "createdAt", "damageDice", "damageType", "description", "equipmentId", "equipped", "id", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "range", "shieldBonus", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "value", "weaponProperties", "weight") SELECT "armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "containerId", "createdAt", "damageDice", "damageType", "description", "equipmentId", "equipped", "id", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "range", "shieldBonus", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "value", "weaponProperties", "weight" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE INDEX "InventoryItem_containerId_idx" ON "InventoryItem"("containerId");
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");
CREATE INDEX "InventoryItem_equipped_idx" ON "InventoryItem"("equipped");
CREATE INDEX "InventoryItem_equipmentId_idx" ON "InventoryItem"("equipmentId");
CREATE INDEX "InventoryItem_type_idx" ON "InventoryItem"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
