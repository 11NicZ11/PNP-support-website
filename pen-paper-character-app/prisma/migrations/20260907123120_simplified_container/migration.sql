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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
