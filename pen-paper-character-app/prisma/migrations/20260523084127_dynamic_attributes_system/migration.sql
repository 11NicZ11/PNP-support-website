/*
  Warnings:

  - You are about to drop the column `charisma` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `constitution` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `dexterity` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `intelligence` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `race` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `savingThrowCharisma` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `savingThrowConstitution` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `savingThrowDexterity` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `savingThrowIntelligence` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `savingThrowStrength` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `savingThrowWisdom` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `strength` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `wisdom` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `attribute` on the `Skill` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CharacterClassLevel_characterId_idx";

-- DropIndex
DROP INDEX "Proficiency_proficiencySource_idx";

-- DropIndex
DROP INDEX "Spell_prepared_idx";

-- CreateTable
CREATE TABLE "Attribute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 10,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attribute_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavingThrow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "attributeId" TEXT,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "proficiencySource" TEXT NOT NULL DEFAULT '',
    "sourceDetail" TEXT NOT NULL DEFAULT '',
    "modifier" INTEGER NOT NULL DEFAULT 0,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavingThrow_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SavingThrow_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "initiativeBonus" INTEGER NOT NULL DEFAULT 0,
    "proficiencyBonus" INTEGER NOT NULL DEFAULT 2,
    "proficiencyBonusName" TEXT NOT NULL DEFAULT 'Übungsbonus',
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
INSERT INTO "new_Character" ("alignment", "armorClass", "backgroundBonds", "backgroundBonusLanguages", "backgroundBonusSkills", "backgroundFeatures", "backgroundFlaws", "backgroundIdeals", "backgroundName", "backgroundTraits", "class", "createdAt", "currentHp", "experience", "id", "initiativeBonus", "level", "name", "notes", "proficiencyBonus", "proficiencyBonusName", "speed", "tempHp", "tempMaxHp", "tempMaxHpMax", "updatedAt") SELECT "alignment", "armorClass", "backgroundBonds", "backgroundBonusLanguages", "backgroundBonusSkills", "backgroundFeatures", "backgroundFlaws", "backgroundIdeals", "backgroundName", "backgroundTraits", "class", "createdAt", "currentHp", "experience", "id", "initiativeBonus", "level", "name", "notes", "proficiencyBonus", "proficiencyBonusName", "speed", "tempHp", "tempMaxHp", "tempMaxHpMax", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_name_idx" ON "Character"("name");
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "attributeId" TEXT,
    "description" TEXT,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "proficiencySource" TEXT NOT NULL DEFAULT '',
    "sourceDetail" TEXT NOT NULL DEFAULT '',
    "modifier" INTEGER NOT NULL DEFAULT 0,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Skill_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Skill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Skill" ("characterId", "createdAt", "description", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt") SELECT "characterId", "createdAt", "description", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
CREATE INDEX "Skill_characterId_idx" ON "Skill"("characterId");
CREATE INDEX "Skill_isProficient_idx" ON "Skill"("isProficient");
CREATE INDEX "Skill_attributeId_idx" ON "Skill"("attributeId");
CREATE UNIQUE INDEX "Skill_characterId_name_key" ON "Skill"("characterId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Attribute_characterId_idx" ON "Attribute"("characterId");

-- CreateIndex
CREATE INDEX "Attribute_isDefault_idx" ON "Attribute"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_characterId_name_key" ON "Attribute"("characterId", "name");

-- CreateIndex
CREATE INDEX "SavingThrow_characterId_idx" ON "SavingThrow"("characterId");

-- CreateIndex
CREATE INDEX "SavingThrow_isProficient_idx" ON "SavingThrow"("isProficient");

-- CreateIndex
CREATE INDEX "SavingThrow_attributeId_idx" ON "SavingThrow"("attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "SavingThrow_characterId_name_key" ON "SavingThrow"("characterId", "name");
