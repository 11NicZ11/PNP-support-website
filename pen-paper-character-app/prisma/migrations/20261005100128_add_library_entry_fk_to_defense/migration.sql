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
    "libraryEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Defense_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Defense_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Defense" ("characterId", "createdAt", "description", "id", "isCustom", "name", "source", "sourceName", "type") SELECT "characterId", "createdAt", "description", "id", "isCustom", "name", "source", "sourceName", "type" FROM "Defense";
DROP TABLE "Defense";
ALTER TABLE "new_Defense" RENAME TO "Defense";
CREATE INDEX "Defense_characterId_idx" ON "Defense"("characterId");
CREATE INDEX "Defense_type_idx" ON "Defense"("type");
CREATE INDEX "Defense_source_idx" ON "Defense"("source");
CREATE INDEX "Defense_characterId_source_sourceName_idx" ON "Defense"("characterId", "source", "sourceName");
CREATE INDEX "Defense_libraryEntryId_idx" ON "Defense"("libraryEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
