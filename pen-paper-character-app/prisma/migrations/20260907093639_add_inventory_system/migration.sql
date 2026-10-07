-- CreateTable
CREATE TABLE "InventoryContainer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "InventoryItem" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "InventoryContainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "InventoryContainer_characterId_idx" ON "InventoryContainer"("characterId");

-- CreateIndex
CREATE INDEX "InventoryContainer_parentId_idx" ON "InventoryContainer"("parentId");

-- CreateIndex
CREATE INDEX "InventoryContainer_type_idx" ON "InventoryContainer"("type");

-- CreateIndex
CREATE INDEX "InventoryItem_containerId_idx" ON "InventoryItem"("containerId");

-- CreateIndex
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");

-- CreateIndex
CREATE INDEX "InventoryItem_equipped_idx" ON "InventoryItem"("equipped");

-- CreateIndex
CREATE INDEX "InventoryItem_equipmentId_idx" ON "InventoryItem"("equipmentId");
