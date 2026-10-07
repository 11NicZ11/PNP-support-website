-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Proficiency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT '📚',
    "isProficient" BOOLEAN NOT NULL DEFAULT true,
    "proficiencySource" TEXT NOT NULL DEFAULT '',
    "sourceDetail" TEXT NOT NULL DEFAULT '',
    "characterId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proficiency_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Proficiency_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Proficiency" ("category", "characterId", "createdAt", "description", "icon", "id", "isProficient", "name", "proficiencySource", "sourceDetail", "updatedAt") SELECT "category", "characterId", "createdAt", "description", "icon", "id", "isProficient", "name", "proficiencySource", "sourceDetail", "updatedAt" FROM "Proficiency";
DROP TABLE "Proficiency";
ALTER TABLE "new_Proficiency" RENAME TO "Proficiency";
CREATE INDEX "Proficiency_characterId_idx" ON "Proficiency"("characterId");
CREATE INDEX "Proficiency_category_idx" ON "Proficiency"("category");
CREATE INDEX "Proficiency_libraryEntryId_idx" ON "Proficiency"("libraryEntryId");
CREATE UNIQUE INDEX "Proficiency_characterId_name_category_key" ON "Proficiency"("characterId", "name", "category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
