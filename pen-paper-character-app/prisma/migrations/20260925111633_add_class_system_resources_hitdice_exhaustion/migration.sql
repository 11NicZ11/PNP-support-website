-- AlterTable
ALTER TABLE "Spell" ADD COLUMN "spellcastingClassLevelId" TEXT;

-- AlterTable
ALTER TABLE "SpellSlot" ADD COLUMN "spellcastingClassLevelId" TEXT;

-- CreateTable
CREATE TABLE "CharacterResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 0,
    "current" INTEGER NOT NULL DEFAULT 0,
    "rechargeType" TEXT NOT NULL DEFAULT 'long',
    "source" TEXT NOT NULL DEFAULT 'class',
    "sourceName" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '✨',
    "description" TEXT NOT NULL DEFAULT '',
    "classLevelId" TEXT,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterResource_classLevelId_fkey" FOREIGN KEY ("classLevelId") REFERENCES "CharacterClassLevel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CharacterResource_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterHitDice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dieType" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "used" INTEGER NOT NULL DEFAULT 0,
    "classLevelId" TEXT,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterHitDice_classLevelId_fkey" FOREIGN KEY ("classLevelId") REFERENCES "CharacterClassLevel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CharacterHitDice_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Action_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Action" ("areaOfEffect", "attackBonus", "characterId", "createdAt", "damageDice", "damageType", "description", "id", "isCustom", "name", "range", "rechargeOnLongRest", "rechargeOnShortRest", "sourceId", "sourceType", "type", "updatedAt", "usesPerDay", "usesRemaining") SELECT "areaOfEffect", "attackBonus", "characterId", "createdAt", "damageDice", "damageType", "description", "id", "isCustom", "name", "range", "rechargeOnLongRest", "rechargeOnShortRest", "sourceId", "sourceType", "type", "updatedAt", "usesPerDay", "usesRemaining" FROM "Action";
DROP TABLE "Action";
ALTER TABLE "new_Action" RENAME TO "Action";
CREATE INDEX "Action_characterId_idx" ON "Action"("characterId");
CREATE INDEX "Action_type_idx" ON "Action"("type");
CREATE INDEX "Action_sourceType_idx" ON "Action"("sourceType");
CREATE INDEX "Action_linkedFeatureId_idx" ON "Action"("linkedFeatureId");
CREATE INDEX "Action_linkedClassLevelId_idx" ON "Action"("linkedClassLevelId");
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
    "attributeMethodState" TEXT NOT NULL DEFAULT '{}',
    "notesCategories" TEXT NOT NULL DEFAULT '[]',
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHp" INTEGER NOT NULL DEFAULT 0,
    "tempMaxHpMax" INTEGER NOT NULL DEFAULT 0,
    "exhaustionLevel" INTEGER NOT NULL DEFAULT 0,
    "lastShortRest" DATETIME,
    "lastLongRest" DATETIME
);
INSERT INTO "new_Character" ("alignment", "attributeMethod", "attributeMethodState", "class", "classProgression", "createdAt", "currentHp", "experience", "id", "level", "levelingMode", "name", "nextLevelExp", "notes", "notesCategories", "race", "tempHp", "tempMaxHp", "tempMaxHpMax", "unitSystem", "updatedAt") SELECT "alignment", "attributeMethod", "attributeMethodState", "class", "classProgression", "createdAt", "currentHp", "experience", "id", "level", "levelingMode", "name", "nextLevelExp", "notes", "notesCategories", "race", "tempHp", "tempMaxHp", "tempMaxHpMax", "unitSystem", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE INDEX "Character_name_idx" ON "Character"("name");
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
CREATE TABLE "new_CharacterClassLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "subclass" TEXT,
    "subclassLevel" INTEGER,
    "level" INTEGER NOT NULL,
    "hitDie" TEXT NOT NULL DEFAULT 'd8',
    "features" TEXT NOT NULL DEFAULT '[]',
    "spellcastingAbility" TEXT NOT NULL DEFAULT 'none',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "leftAtLevel" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterClassLevel_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CharacterClassLevel" ("characterId", "className", "createdAt", "features", "id", "level", "subclass", "updatedAt") SELECT "characterId", "className", "createdAt", "features", "id", "level", "subclass", "updatedAt" FROM "CharacterClassLevel";
DROP TABLE "CharacterClassLevel";
ALTER TABLE "new_CharacterClassLevel" RENAME TO "CharacterClassLevel";
CREATE INDEX "CharacterClassLevel_characterId_className_idx" ON "CharacterClassLevel"("characterId", "className");
CREATE INDEX "CharacterClassLevel_characterId_isActive_idx" ON "CharacterClassLevel"("characterId", "isActive");
CREATE UNIQUE INDEX "CharacterClassLevel_characterId_className_level_key" ON "CharacterClassLevel"("characterId", "className", "level");
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StatusEffect_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StatusEffect" ("characterId", "createdAt", "description", "duration", "durationUnit", "expiresAt", "icon", "id", "isActive", "level", "name", "source", "sourceName", "updatedAt") SELECT "characterId", "createdAt", "description", "duration", "durationUnit", "expiresAt", "icon", "id", "isActive", "level", "name", "source", "sourceName", "updatedAt" FROM "StatusEffect";
DROP TABLE "StatusEffect";
ALTER TABLE "new_StatusEffect" RENAME TO "StatusEffect";
CREATE INDEX "StatusEffect_characterId_idx" ON "StatusEffect"("characterId");
CREATE INDEX "StatusEffect_isActive_idx" ON "StatusEffect"("isActive");
CREATE INDEX "StatusEffect_expiresAt_idx" ON "StatusEffect"("expiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CharacterResource_characterId_idx" ON "CharacterResource"("characterId");

-- CreateIndex
CREATE INDEX "CharacterResource_classLevelId_idx" ON "CharacterResource"("classLevelId");

-- CreateIndex
CREATE INDEX "CharacterResource_rechargeType_idx" ON "CharacterResource"("rechargeType");

-- CreateIndex
CREATE INDEX "CharacterHitDice_characterId_idx" ON "CharacterHitDice"("characterId");

-- CreateIndex
CREATE INDEX "CharacterHitDice_classLevelId_idx" ON "CharacterHitDice"("classLevelId");

-- CreateIndex
CREATE INDEX "Spell_spellcastingClassLevelId_idx" ON "Spell"("spellcastingClassLevelId");

-- CreateIndex
CREATE INDEX "SpellSlot_spellcastingClassLevelId_idx" ON "SpellSlot"("spellcastingClassLevelId");
