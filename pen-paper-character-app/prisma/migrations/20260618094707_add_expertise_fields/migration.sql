-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavingThrow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "attributeName" TEXT NOT NULL,
    "isProficient" BOOLEAN NOT NULL DEFAULT false,
    "expertise" BOOLEAN NOT NULL DEFAULT false,
    "proficiencySource" TEXT NOT NULL DEFAULT '',
    "sourceDetail" TEXT NOT NULL DEFAULT '',
    "modifier" INTEGER NOT NULL DEFAULT 0,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavingThrow_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavingThrow" ("attributeName", "characterId", "createdAt", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt") SELECT "attributeName", "characterId", "createdAt", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt" FROM "SavingThrow";
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
    "expertise" BOOLEAN NOT NULL DEFAULT false,
    "proficiencySource" TEXT NOT NULL DEFAULT '',
    "sourceDetail" TEXT NOT NULL DEFAULT '',
    "modifier" INTEGER NOT NULL DEFAULT 0,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Skill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Skill" ("attributeName", "characterId", "createdAt", "description", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt") SELECT "attributeName", "characterId", "createdAt", "description", "id", "isProficient", "modifier", "name", "proficiencySource", "sourceDetail", "updatedAt" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
CREATE INDEX "Skill_characterId_idx" ON "Skill"("characterId");
CREATE INDEX "Skill_isProficient_idx" ON "Skill"("isProficient");
CREATE INDEX "Skill_attributeName_idx" ON "Skill"("attributeName");
CREATE UNIQUE INDEX "Skill_characterId_name_key" ON "Skill"("characterId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
