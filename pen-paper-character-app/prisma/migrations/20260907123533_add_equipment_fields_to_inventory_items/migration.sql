-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" REAL,
    "value" INTEGER,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
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
    "maxDexBonus" INTEGER,
    "stealthDisadvantage" BOOLEAN NOT NULL DEFAULT false,
    "strengthRequirement" INTEGER,
    "shieldBonus" INTEGER DEFAULT 0,
    "attunement" BOOLEAN NOT NULL DEFAULT false,
    "attuned" BOOLEAN NOT NULL DEFAULT false,
    "equipmentId" TEXT,
    "containerId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "InventoryContainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("characterId", "containerId", "createdAt", "description", "equipmentId", "equipped", "id", "name", "notes", "quantity", "updatedAt", "value", "weight") SELECT "characterId", "containerId", "createdAt", "description", "equipmentId", "equipped", "id", "name", "notes", "quantity", "updatedAt", "value", "weight" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE INDEX "InventoryItem_containerId_idx" ON "InventoryItem"("containerId");
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");
CREATE INDEX "InventoryItem_equipped_idx" ON "InventoryItem"("equipped");
CREATE INDEX "InventoryItem_equipmentId_idx" ON "InventoryItem"("equipmentId");
CREATE INDEX "InventoryItem_type_idx" ON "InventoryItem"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
