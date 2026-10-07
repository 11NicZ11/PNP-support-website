-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlternateForm" (
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
    "libraryEntryId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AlternateForm_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlternateForm_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AlternateForm" ("abilities", "activationType", "armorClass", "attacks", "challengeRating", "characterId", "charisma", "concentration", "constitution", "createdAt", "creatureType", "description", "dexterity", "durationType", "durationValue", "hpCurrent", "hpFormula", "hpMax", "icon", "id", "intelligence", "isActive", "linkedFeatureId", "linkedResourceId", "name", "rechargeType", "size", "source", "sourceReference", "speedBurrow", "speedClimb", "speedFly", "speedSwim", "speedWalk", "strength", "updatedAt", "usesPerRest", "wisdom") SELECT "abilities", "activationType", "armorClass", "attacks", "challengeRating", "characterId", "charisma", "concentration", "constitution", "createdAt", "creatureType", "description", "dexterity", "durationType", "durationValue", "hpCurrent", "hpFormula", "hpMax", "icon", "id", "intelligence", "isActive", "linkedFeatureId", "linkedResourceId", "name", "rechargeType", "size", "source", "sourceReference", "speedBurrow", "speedClimb", "speedFly", "speedSwim", "speedWalk", "strength", "updatedAt", "usesPerRest", "wisdom" FROM "AlternateForm";
DROP TABLE "AlternateForm";
ALTER TABLE "new_AlternateForm" RENAME TO "AlternateForm";
CREATE INDEX "AlternateForm_characterId_idx" ON "AlternateForm"("characterId");
CREATE INDEX "AlternateForm_characterId_isActive_idx" ON "AlternateForm"("characterId", "isActive");
CREATE INDEX "AlternateForm_linkedResourceId_idx" ON "AlternateForm"("linkedResourceId");
CREATE INDEX "AlternateForm_linkedFeatureId_idx" ON "AlternateForm"("linkedFeatureId");
CREATE INDEX "AlternateForm_libraryEntryId_idx" ON "AlternateForm"("libraryEntryId");
CREATE TABLE "new_Companion" (
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
    "libraryEntryId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Companion_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Companion_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Companion" ("abilities", "armorClass", "attacks", "behavior", "behaviorNote", "challengeRating", "characterId", "charisma", "constitution", "createdAt", "creatureType", "dexterity", "hpCurrent", "hpMax", "icon", "id", "intelligence", "isActive", "isDismissed", "languages", "linkedFeatureId", "linkedResourceId", "name", "notes", "senses", "size", "source", "sourceReference", "speedBurrow", "speedClimb", "speedFly", "speedSwim", "speedWalk", "strength", "tempHp", "type", "updatedAt", "wisdom") SELECT "abilities", "armorClass", "attacks", "behavior", "behaviorNote", "challengeRating", "characterId", "charisma", "constitution", "createdAt", "creatureType", "dexterity", "hpCurrent", "hpMax", "icon", "id", "intelligence", "isActive", "isDismissed", "languages", "linkedFeatureId", "linkedResourceId", "name", "notes", "senses", "size", "source", "sourceReference", "speedBurrow", "speedClimb", "speedFly", "speedSwim", "speedWalk", "strength", "tempHp", "type", "updatedAt", "wisdom" FROM "Companion";
DROP TABLE "Companion";
ALTER TABLE "new_Companion" RENAME TO "Companion";
CREATE INDEX "Companion_characterId_idx" ON "Companion"("characterId");
CREATE INDEX "Companion_characterId_isActive_idx" ON "Companion"("characterId", "isActive");
CREATE INDEX "Companion_characterId_isDismissed_idx" ON "Companion"("characterId", "isDismissed");
CREATE INDEX "Companion_linkedResourceId_idx" ON "Companion"("linkedResourceId");
CREATE INDEX "Companion_linkedFeatureId_idx" ON "Companion"("linkedFeatureId");
CREATE INDEX "Companion_libraryEntryId_idx" ON "Companion"("libraryEntryId");
CREATE TABLE "new_InventoryContainer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'container',
    "description" TEXT,
    "capacity" INTEGER,
    "weightLimit" REAL,
    "weightUnit" TEXT NOT NULL DEFAULT 'kg',
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "parentId" TEXT,
    "characterId" TEXT NOT NULL,
    "libraryEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryContainer_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryContainer_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryContainer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "InventoryContainer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryContainer" ("capacity", "characterId", "createdAt", "description", "id", "name", "parentId", "sourceReference", "type", "updatedAt", "weightLimit", "weightUnit") SELECT "capacity", "characterId", "createdAt", "description", "id", "name", "parentId", "sourceReference", "type", "updatedAt", "weightLimit", "weightUnit" FROM "InventoryContainer";
DROP TABLE "InventoryContainer";
ALTER TABLE "new_InventoryContainer" RENAME TO "InventoryContainer";
CREATE INDEX "InventoryContainer_characterId_idx" ON "InventoryContainer"("characterId");
CREATE INDEX "InventoryContainer_parentId_idx" ON "InventoryContainer"("parentId");
CREATE INDEX "InventoryContainer_type_idx" ON "InventoryContainer"("type");
CREATE INDEX "InventoryContainer_libraryEntryId_idx" ON "InventoryContainer"("libraryEntryId");
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" REAL,
    "value" INTEGER,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "equipmentId" TEXT,
    "containerId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "type" TEXT,
    "subtype" TEXT,
    "magicBonus" INTEGER DEFAULT 0,
    "attackBonus" INTEGER DEFAULT 0,
    "damageDice" TEXT,
    "damageType" TEXT,
    "range" TEXT,
    "weaponProperties" TEXT,
    "armorClassBonus" INTEGER DEFAULT 0,
    "armorType" TEXT,
    "maxDexBonus" INTEGER DEFAULT 0,
    "stealthDisadvantage" BOOLEAN NOT NULL DEFAULT false,
    "strengthRequirement" INTEGER DEFAULT 0,
    "shieldBonus" INTEGER DEFAULT 0,
    "attunement" BOOLEAN NOT NULL DEFAULT false,
    "attuned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "libraryEntryId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "InventoryContainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "containerId", "createdAt", "damageDice", "damageType", "description", "equipmentId", "equipped", "id", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "range", "shieldBonus", "sourceReference", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "value", "weaponProperties", "weight") SELECT "armorClassBonus", "armorType", "attackBonus", "attuned", "attunement", "characterId", "containerId", "createdAt", "damageDice", "damageType", "description", "equipmentId", "equipped", "id", "magicBonus", "maxDexBonus", "name", "notes", "quantity", "range", "shieldBonus", "sourceReference", "stealthDisadvantage", "strengthRequirement", "subtype", "type", "updatedAt", "value", "weaponProperties", "weight" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE INDEX "InventoryItem_containerId_idx" ON "InventoryItem"("containerId");
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");
CREATE INDEX "InventoryItem_equipped_idx" ON "InventoryItem"("equipped");
CREATE INDEX "InventoryItem_equipmentId_idx" ON "InventoryItem"("equipmentId");
CREATE INDEX "InventoryItem_type_idx" ON "InventoryItem"("type");
CREATE INDEX "InventoryItem_libraryEntryId_idx" ON "InventoryItem"("libraryEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
