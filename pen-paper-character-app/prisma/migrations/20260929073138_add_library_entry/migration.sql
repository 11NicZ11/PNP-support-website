-- CreateTable
CREATE TABLE "LibraryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '📚',
    "data" TEXT NOT NULL DEFAULT '{}',
    "isSeed" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "LibraryEntry_type_idx" ON "LibraryEntry"("type");

-- CreateIndex
CREATE INDEX "LibraryEntry_type_category_idx" ON "LibraryEntry"("type", "category");

-- CreateIndex
CREATE INDEX "LibraryEntry_isSeed_idx" ON "LibraryEntry"("isSeed");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryEntry_type_category_name_key" ON "LibraryEntry"("type", "category", "name");
