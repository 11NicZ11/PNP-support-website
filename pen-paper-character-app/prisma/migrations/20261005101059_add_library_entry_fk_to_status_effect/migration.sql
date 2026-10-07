-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StatusEffect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT '⚠️',
    "duration" INTEGER,
    "durationUnit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "sourceName" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isConcentration" BOOLEAN NOT NULL DEFAULT false,
    "linkedFeatureId" TEXT,
    "characterId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StatusEffect_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StatusEffect_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StatusEffect" ("characterId", "createdAt", "description", "duration", "durationUnit", "expiresAt", "icon", "id", "isActive", "isConcentration", "level", "linkedFeatureId", "name", "source", "sourceName", "updatedAt") SELECT "characterId", "createdAt", "description", "duration", "durationUnit", "expiresAt", "icon", "id", "isActive", "isConcentration", "level", "linkedFeatureId", "name", "source", "sourceName", "updatedAt" FROM "StatusEffect";
DROP TABLE "StatusEffect";
ALTER TABLE "new_StatusEffect" RENAME TO "StatusEffect";
CREATE INDEX "StatusEffect_characterId_idx" ON "StatusEffect"("characterId");
CREATE INDEX "StatusEffect_isActive_idx" ON "StatusEffect"("isActive");
CREATE INDEX "StatusEffect_expiresAt_idx" ON "StatusEffect"("expiresAt");
CREATE INDEX "StatusEffect_libraryEntryId_idx" ON "StatusEffect"("libraryEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
