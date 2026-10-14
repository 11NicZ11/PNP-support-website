/*
  Warnings:

  - You are about to drop the column `weightUnit` on the `InventoryContainer` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "EquipmentWeaponProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "name" TEXT NOT NULL,
    "valueNumber" REAL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EquipmentWeaponProperty_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EquipmentWeaponProperty_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItemWeaponProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inventoryItemId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "name" TEXT NOT NULL,
    "valueNumber" REAL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryItemWeaponProperty_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItemWeaponProperty_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

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
    "containerWeight" INTEGER,
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "parentId" TEXT,
    "characterId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryContainer_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryContainer_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryContainer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "InventoryContainer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryContainer" ("capacity", "characterId", "containerWeight", "createdAt", "description", "id", "libraryEntryId", "name", "parentId", "sourceReference", "type", "updatedAt", "weightLimit") SELECT "capacity", "characterId", "containerWeight", "createdAt", "description", "id", "libraryEntryId", "name", "parentId", "sourceReference", "type", "updatedAt", "weightLimit" FROM "InventoryContainer";
DROP TABLE "InventoryContainer";
ALTER TABLE "new_InventoryContainer" RENAME TO "InventoryContainer";
CREATE INDEX "InventoryContainer_characterId_idx" ON "InventoryContainer"("characterId");
CREATE INDEX "InventoryContainer_parentId_idx" ON "InventoryContainer"("parentId");
CREATE INDEX "InventoryContainer_type_idx" ON "InventoryContainer"("type");
CREATE INDEX "InventoryContainer_libraryEntryId_idx" ON "InventoryContainer"("libraryEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "EquipmentWeaponProperty_equipmentId_idx" ON "EquipmentWeaponProperty"("equipmentId");

-- CreateIndex
CREATE INDEX "EquipmentWeaponProperty_libraryEntryId_idx" ON "EquipmentWeaponProperty"("libraryEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentWeaponProperty_equipmentId_name_key" ON "EquipmentWeaponProperty"("equipmentId", "name");

-- CreateIndex
CREATE INDEX "InventoryItemWeaponProperty_inventoryItemId_idx" ON "InventoryItemWeaponProperty"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryItemWeaponProperty_libraryEntryId_idx" ON "InventoryItemWeaponProperty"("libraryEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItemWeaponProperty_inventoryItemId_name_key" ON "InventoryItemWeaponProperty"("inventoryItemId", "name");
