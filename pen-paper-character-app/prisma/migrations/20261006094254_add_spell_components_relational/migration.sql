/*
  Warnings:

  - You are about to drop the column `components` on the `Spell` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SpellComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spellId" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpellComponent_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "school" TEXT,
    "castingTime" TEXT,
    "range" TEXT,
    "rangeValue" REAL,
    "materialComponent" TEXT,
    "duration" TEXT,
    "description" TEXT,
    "higherLevels" TEXT,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "ritual" BOOLEAN NOT NULL DEFAULT false,
    "prepared" BOOLEAN NOT NULL DEFAULT false,
    "alwaysPrepared" BOOLEAN NOT NULL DEFAULT false,
    "attackType" TEXT,
    "savingThrow" TEXT,
    "damageDice" TEXT,
    "damageType" TEXT,
    "aoeShape" TEXT,
    "aoeSize" REAL,
    "upcastEnabled" BOOLEAN NOT NULL DEFAULT false,
    "upcastType" TEXT,
    "upcastValue" TEXT,
    "spellcastingClassLevelId" TEXT,
    "characterId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Spell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Spell_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Spell" ("alwaysPrepared", "aoeShape", "aoeSize", "attackType", "castingTime", "characterId", "concentration", "createdAt", "damageDice", "damageType", "description", "duration", "higherLevels", "id", "level", "libraryEntryId", "materialComponent", "name", "prepared", "range", "rangeValue", "ritual", "savingThrow", "school", "spellcastingClassLevelId", "upcastEnabled", "upcastType", "upcastValue", "updatedAt") SELECT "alwaysPrepared", "aoeShape", "aoeSize", "attackType", "castingTime", "characterId", "concentration", "createdAt", "damageDice", "damageType", "description", "duration", "higherLevels", "id", "level", "libraryEntryId", "materialComponent", "name", "prepared", "range", "rangeValue", "ritual", "savingThrow", "school", "spellcastingClassLevelId", "upcastEnabled", "upcastType", "upcastValue", "updatedAt" FROM "Spell";
DROP TABLE "Spell";
ALTER TABLE "new_Spell" RENAME TO "Spell";
CREATE INDEX "Spell_characterId_idx" ON "Spell"("characterId");
CREATE INDEX "Spell_level_idx" ON "Spell"("level");
CREATE INDEX "Spell_prepared_idx" ON "Spell"("prepared");
CREATE INDEX "Spell_spellcastingClassLevelId_idx" ON "Spell"("spellcastingClassLevelId");
CREATE INDEX "Spell_libraryEntryId_idx" ON "Spell"("libraryEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SpellComponent_spellId_idx" ON "SpellComponent"("spellId");

-- CreateIndex
CREATE UNIQUE INDEX "SpellComponent_spellId_component_key" ON "SpellComponent"("spellId", "component");
