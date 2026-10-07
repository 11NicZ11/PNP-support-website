-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Action" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "attackBonus" INTEGER,
    "damageDice" TEXT,
    "damageType" TEXT,
    "range" TEXT,
    "areaOfEffect" TEXT,
    "usesPerDay" INTEGER,
    "usesRemaining" INTEGER,
    "rechargeType" TEXT NOT NULL DEFAULT 'long',
    "rechargeOnShortRest" BOOLEAN NOT NULL DEFAULT false,
    "rechargeOnLongRest" BOOLEAN NOT NULL DEFAULT false,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "savingThrow" TEXT,
    "savingThrowDC" INTEGER,
    "linkedFeatureId" TEXT,
    "linkedClassLevelId" TEXT,
    "characterId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Action_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Action_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Action" ("areaOfEffect", "attackBonus", "characterId", "concentration", "createdAt", "damageDice", "damageType", "description", "id", "isCustom", "linkedClassLevelId", "linkedFeatureId", "name", "range", "rechargeOnLongRest", "rechargeOnShortRest", "rechargeType", "savingThrow", "savingThrowDC", "sourceId", "sourceType", "type", "updatedAt", "usesPerDay", "usesRemaining") SELECT "areaOfEffect", "attackBonus", "characterId", "concentration", "createdAt", "damageDice", "damageType", "description", "id", "isCustom", "linkedClassLevelId", "linkedFeatureId", "name", "range", "rechargeOnLongRest", "rechargeOnShortRest", "rechargeType", "savingThrow", "savingThrowDC", "sourceId", "sourceType", "type", "updatedAt", "usesPerDay", "usesRemaining" FROM "Action";
DROP TABLE "Action";
ALTER TABLE "new_Action" RENAME TO "Action";
CREATE INDEX "Action_characterId_idx" ON "Action"("characterId");
CREATE INDEX "Action_type_idx" ON "Action"("type");
CREATE INDEX "Action_sourceType_idx" ON "Action"("sourceType");
CREATE INDEX "Action_linkedFeatureId_idx" ON "Action"("linkedFeatureId");
CREATE INDEX "Action_linkedClassLevelId_idx" ON "Action"("linkedClassLevelId");
CREATE INDEX "Action_libraryEntryId_idx" ON "Action"("libraryEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
