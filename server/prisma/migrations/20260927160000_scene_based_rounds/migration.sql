ALTER TABLE "Character"
ADD COLUMN "sceneId" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "GameSession"
ADD COLUMN "sceneId" INTEGER NOT NULL DEFAULT 1;

DROP INDEX "Character_name_key";

CREATE UNIQUE INDEX "Character_name_sceneId_key"
ON "Character"("name", "sceneId");