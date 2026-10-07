-- CreateTable
CREATE TABLE "SpellSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rank" INTEGER NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "used" INTEGER NOT NULL DEFAULT 0,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SpellSlot_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "components" TEXT,
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
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Spell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Spell" ("alwaysPrepared", "attackType", "castingTime", "characterId", "components", "concentration", "createdAt", "damageDice", "damageType", "description", "duration", "higherLevels", "id", "level", "materialComponent", "name", "prepared", "range", "ritual", "savingThrow", "school", "updatedAt") SELECT "alwaysPrepared", "attackType", "castingTime", "characterId", "components", "concentration", "createdAt", "damageDice", "damageType", "description", "duration", "higherLevels", "id", "level", "materialComponent", "name", "prepared", "range", "ritual", "savingThrow", "school", "updatedAt" FROM "Spell";
DROP TABLE "Spell";
ALTER TABLE "new_Spell" RENAME TO "Spell";
CREATE INDEX "Spell_characterId_idx" ON "Spell"("characterId");
CREATE INDEX "Spell_level_idx" ON "Spell"("level");
CREATE INDEX "Spell_prepared_idx" ON "Spell"("prepared");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SpellSlot_characterId_idx" ON "SpellSlot"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "SpellSlot_characterId_rank_key" ON "SpellSlot"("characterId", "rank");
