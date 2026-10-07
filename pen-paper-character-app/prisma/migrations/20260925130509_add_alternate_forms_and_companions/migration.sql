-- CreateTable
CREATE TABLE "AlternateForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'wild_shape',
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '🐺',
    "challengeRating" TEXT NOT NULL DEFAULT '0',
    "size" TEXT NOT NULL DEFAULT 'medium',
    "creatureType" TEXT NOT NULL DEFAULT '',
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "hpMax" INTEGER NOT NULL DEFAULT 1,
    "hpCurrent" INTEGER NOT NULL DEFAULT 1,
    "hpFormula" TEXT NOT NULL DEFAULT '',
    "strength" INTEGER NOT NULL DEFAULT 10,
    "dexterity" INTEGER NOT NULL DEFAULT 10,
    "constitution" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "wisdom" INTEGER NOT NULL DEFAULT 10,
    "charisma" INTEGER NOT NULL DEFAULT 10,
    "speedWalk" INTEGER NOT NULL DEFAULT 30,
    "speedFly" INTEGER NOT NULL DEFAULT 0,
    "speedSwim" INTEGER NOT NULL DEFAULT 0,
    "speedClimb" INTEGER NOT NULL DEFAULT 0,
    "speedBurrow" INTEGER NOT NULL DEFAULT 0,
    "attacks" TEXT NOT NULL DEFAULT '[]',
    "abilities" TEXT NOT NULL DEFAULT '[]',
    "activationType" TEXT NOT NULL DEFAULT 'action',
    "durationType" TEXT NOT NULL DEFAULT 'hours',
    "durationValue" INTEGER NOT NULL DEFAULT 1,
    "usesPerRest" INTEGER,
    "rechargeType" TEXT NOT NULL DEFAULT 'short',
    "linkedResourceId" TEXT,
    "linkedFeatureId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AlternateForm_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Companion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'familiar',
    "source" TEXT NOT NULL DEFAULT 'find_familiar',
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '🐾',
    "creatureType" TEXT NOT NULL DEFAULT '',
    "size" TEXT NOT NULL DEFAULT 'tiny',
    "challengeRating" TEXT NOT NULL DEFAULT '0',
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "hpMax" INTEGER NOT NULL DEFAULT 1,
    "hpCurrent" INTEGER NOT NULL DEFAULT 1,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "dexterity" INTEGER NOT NULL DEFAULT 10,
    "constitution" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "wisdom" INTEGER NOT NULL DEFAULT 10,
    "charisma" INTEGER NOT NULL DEFAULT 10,
    "speedWalk" INTEGER NOT NULL DEFAULT 30,
    "speedFly" INTEGER NOT NULL DEFAULT 0,
    "speedSwim" INTEGER NOT NULL DEFAULT 0,
    "speedClimb" INTEGER NOT NULL DEFAULT 0,
    "speedBurrow" INTEGER NOT NULL DEFAULT 0,
    "senses" TEXT NOT NULL DEFAULT '',
    "languages" TEXT NOT NULL DEFAULT '',
    "attacks" TEXT NOT NULL DEFAULT '[]',
    "abilities" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "behavior" TEXT NOT NULL DEFAULT 'follow',
    "behaviorNote" TEXT NOT NULL DEFAULT '',
    "linkedResourceId" TEXT,
    "linkedFeatureId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Companion_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AlternateForm_characterId_idx" ON "AlternateForm"("characterId");

-- CreateIndex
CREATE INDEX "AlternateForm_characterId_isActive_idx" ON "AlternateForm"("characterId", "isActive");

-- CreateIndex
CREATE INDEX "AlternateForm_linkedResourceId_idx" ON "AlternateForm"("linkedResourceId");

-- CreateIndex
CREATE INDEX "AlternateForm_linkedFeatureId_idx" ON "AlternateForm"("linkedFeatureId");

-- CreateIndex
CREATE INDEX "Companion_characterId_idx" ON "Companion"("characterId");

-- CreateIndex
CREATE INDEX "Companion_characterId_isActive_idx" ON "Companion"("characterId", "isActive");

-- CreateIndex
CREATE INDEX "Companion_characterId_isDismissed_idx" ON "Companion"("characterId", "isDismissed");

-- CreateIndex
CREATE INDEX "Companion_linkedResourceId_idx" ON "Companion"("linkedResourceId");

-- CreateIndex
CREATE INDEX "Companion_linkedFeatureId_idx" ON "Companion"("linkedFeatureId");
