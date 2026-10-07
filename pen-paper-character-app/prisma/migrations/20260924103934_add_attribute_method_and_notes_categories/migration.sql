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
    "updatedAt" DATETIME NOT NULL,
    "levelingMode" TEXT NOT NULL DEFAULT 'milestone',
    "unitSystem" TEXT NOT NULL DEFAULT 'metric',
    "classProgression" TEXT NOT NULL DEFAULT 'single',
    "nextLevelExp" INTEGER NOT NULL DEFAULT 300,
    "attributeMethod" TEXT NOT NULL DEFAULT 'free',
    "notesCategories" TEXT NOT NULL DEFAULT '[]',
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHpMax" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Character" ("alignment", "class", "classProgression", "createdAt", "currentHp", "experience", "id", "level", "levelingMode", "name", "nextLevelExp", "notes", "race", "tempHp", "tempMaxHp", "tempMaxHpMax", "unitSystem", "updatedAt") SELECT "alignment", "class", "classProgression", "createdAt", "currentHp", "experience", "id", "level", "levelingMode", "name", "nextLevelExp", "notes", "race", "tempHp", "tempMaxHp", "tempMaxHpMax", "unitSystem", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_name_idx" ON "Character"("name");
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
