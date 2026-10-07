/*
  Warnings:

  - You are about to drop the column `backgroundBonds` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundBonusLanguages` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundBonusSkills` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundFeatures` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundFlaws` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundIdeals` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundName` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundTraits` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `currentHp` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `tempHp` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `tempMaxHp` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `tempMaxHpMax` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `attributeId` on the `SavingThrow` table. All the data in the column will be lost.
  - You are about to drop the column `attributeId` on the `Skill` table. All the data in the column will be lost.
  - Added the required column `race` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attributeName` to the `SavingThrow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attributeName` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Background" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "traits" TEXT NOT NULL DEFAULT '',
    "ideals" TEXT NOT NULL DEFAULT '',
    "bonds" TEXT NOT NULL DEFAULT '',
    "flaws" TEXT NOT NULL DEFAULT '',
    "features" TEXT NOT NULL DEFAULT '',
    "bonusSkills" TEXT NOT NULL DEFAULT '[]',
    "bonusLanguages" TEXT NOT NULL DEFAULT '[]',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Background_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "alignment" TEXT NOT NULL DEFAULT '',
    "experience" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Character" ("alignment", "class", "createdAt", "experience", "id", "level", "name", "notes", "updatedAt") SELECT "alignment", "class", "createdAt", "experience", "id", "level", "name", "notes", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_name_idx" ON "Character"("name");
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
CREATE TABLE "new_SavingThrow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "attributeName" TEXT NOT NULL,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "proficiencySource" TEXT NOT NULL DEFAULT '',
    "sourceDetail" TEXT NOT NULL DEFAULT '',
    "modifier" INTEGER NOT NULL DEFAULT 0,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavingThrow_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavingThrow" ("characterId", "createdAt", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt") SELECT "characterId", "createdAt", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt" FROM "SavingThrow";
DROP TABLE "SavingThrow";
ALTER TABLE "new_SavingThrow" RENAME TO "SavingThrow";
CREATE INDEX "SavingThrow_characterId_idx" ON "SavingThrow"("characterId");
CREATE INDEX "SavingThrow_isProficient_idx" ON "SavingThrow"("isProficient");
CREATE INDEX "SavingThrow_attributeName_idx" ON "SavingThrow"("attributeName");
CREATE UNIQUE INDEX "SavingThrow_characterId_name_key" ON "SavingThrow"("characterId", "name");
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "attributeName" TEXT NOT NULL,
    "description" TEXT,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "proficiencySource" TEXT NOT NULL DEFAULT '',
    "sourceDetail" TEXT NOT NULL DEFAULT '',
    "modifier" INTEGER NOT NULL DEFAULT 0,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Skill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Skill" ("characterId", "createdAt", "description", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt") SELECT "characterId", "createdAt", "description", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
CREATE INDEX "Skill_characterId_idx" ON "Skill"("characterId");
CREATE INDEX "Skill_isProficient_idx" ON "Skill"("isProficient");
CREATE INDEX "Skill_attributeName_idx" ON "Skill"("attributeName");
CREATE UNIQUE INDEX "Skill_characterId_name_key" ON "Skill"("characterId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Background_characterId_key" ON "Background"("characterId");
