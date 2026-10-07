-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "alignment" TEXT NOT NULL DEFAULT '',
    "experience" INTEGER NOT NULL DEFAULT 0,
    "attributes" TEXT NOT NULL DEFAULT '{"strength":10,"dexterity":10,"constitution":10,"intelligence":10,"wisdom":10,"charisma":10}',
    "combat" TEXT NOT NULL DEFAULT '{"maxHp":10,"currentHp":10,"tempHp":0,"tempMaxHp":0,"tempMaxHpMax":0,"armorClass":10,"speed":30,"initiativeBonus":0,"proficiencyBonus":2}',
    "savingThrows" TEXT NOT NULL DEFAULT '{}',
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

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Proficiency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT '📚',
    "isProficient" BOOLEAN NOT NULL DEFAULT true,
    "proficiencySource" TEXT NOT NULL DEFAULT '',
    "sourceDetail" TEXT NOT NULL DEFAULT '',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proficiency_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusEffect" (
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
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StatusEffect_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Defense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "sourceName" TEXT,
    "isPermanent" BOOLEAN NOT NULL DEFAULT true,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "Defense_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "resetOn" TEXT NOT NULL DEFAULT 'long',
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassFeature_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Character_name_idx" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");

-- CreateIndex
CREATE INDEX "Skill_characterId_idx" ON "Skill"("characterId");

-- CreateIndex
CREATE INDEX "Skill_isProficient_idx" ON "Skill"("isProficient");

-- CreateIndex
CREATE INDEX "Skill_proficiencySource_idx" ON "Skill"("proficiencySource");

-- CreateIndex
CREATE INDEX "Skill_attribute_idx" ON "Skill"("attribute");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_characterId_name_key" ON "Skill"("characterId", "name");

-- CreateIndex
CREATE INDEX "Proficiency_characterId_idx" ON "Proficiency"("characterId");

-- CreateIndex
CREATE INDEX "Proficiency_category_idx" ON "Proficiency"("category");

-- CreateIndex
CREATE INDEX "Proficiency_proficiencySource_idx" ON "Proficiency"("proficiencySource");

-- CreateIndex
CREATE UNIQUE INDEX "Proficiency_characterId_name_category_key" ON "Proficiency"("characterId", "name", "category");

-- CreateIndex
CREATE INDEX "StatusEffect_characterId_idx" ON "StatusEffect"("characterId");

-- CreateIndex
CREATE INDEX "StatusEffect_isActive_idx" ON "StatusEffect"("isActive");

-- CreateIndex
CREATE INDEX "StatusEffect_expiresAt_idx" ON "StatusEffect"("expiresAt");

-- CreateIndex
CREATE INDEX "Defense_characterId_idx" ON "Defense"("characterId");

-- CreateIndex
CREATE INDEX "Defense_type_idx" ON "Defense"("type");

-- CreateIndex
CREATE INDEX "Defense_isPermanent_idx" ON "Defense"("isPermanent");

-- CreateIndex
CREATE UNIQUE INDEX "Defense_characterId_type_name_key" ON "Defense"("characterId", "type", "name");

-- CreateIndex
CREATE INDEX "ClassFeature_characterId_idx" ON "ClassFeature"("characterId");

-- CreateIndex
CREATE INDEX "ClassFeature_level_idx" ON "ClassFeature"("level");

-- CreateIndex
CREATE INDEX "ClassFeature_isAvailable_idx" ON "ClassFeature"("isAvailable");
