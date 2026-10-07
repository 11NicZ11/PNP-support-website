/*
  Warnings:

  - You are about to drop the column `armorClass` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `initiativeBonus` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `proficiencyBonus` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `proficiencyBonusName` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `speed` on the `Character` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CombatValueSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "dependsOn" TEXT,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CombatValueSource_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "class" TEXT NOT NULL,
    "alignment" TEXT NOT NULL DEFAULT '',
    "experience" INTEGER NOT NULL DEFAULT 0,
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHpMax" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "backgroundName" TEXT NOT NULL DEFAULT '',
    "backgroundTraits" TEXT NOT NULL DEFAULT '',
    "backgroundIdeals" TEXT NOT NULL DEFAULT '',
    "backgroundBonds" TEXT NOT NULL DEFAULT '',
    "backgroundFlaws" TEXT NOT NULL DEFAULT '',
    "backgroundFeatures" TEXT NOT NULL DEFAULT '',
    "backgroundBonusSkills" TEXT NOT NULL DEFAULT '[]',
    "backgroundBonusLanguages" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Character" ("alignment", "backgroundBonds", "backgroundBonusLanguages", "backgroundBonusSkills", "backgroundFeatures", "backgroundFlaws", "backgroundIdeals", "backgroundName", "backgroundTraits", "class", "createdAt", "currentHp", "experience", "id", "level", "name", "notes", "tempHp", "tempMaxHp", "tempMaxHpMax", "updatedAt") SELECT "alignment", "backgroundBonds", "backgroundBonusLanguages", "backgroundBonusSkills", "backgroundFeatures", "backgroundFlaws", "backgroundIdeals", "backgroundName", "backgroundTraits", "class", "createdAt", "currentHp", "experience", "id", "level", "name", "notes", "tempHp", "tempMaxHp", "tempMaxHpMax", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_name_idx" ON "Character"("name");
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CombatValueSource_characterId_type_idx" ON "CombatValueSource"("characterId", "type");
