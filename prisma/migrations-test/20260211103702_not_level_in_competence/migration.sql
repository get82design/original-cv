/*
  Warnings:

  - You are about to drop the column `level` on the `CvCompetence` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `ProfileCompetence` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CvCompetence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competenceId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "CvCompetence_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "Competence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CvCompetence_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CvCompetenceGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvCompetence" ("competenceId", "groupId", "id") SELECT "competenceId", "groupId", "id" FROM "CvCompetence";
DROP TABLE "CvCompetence";
ALTER TABLE "new_CvCompetence" RENAME TO "CvCompetence";
CREATE UNIQUE INDEX "CvCompetence_groupId_competenceId_key" ON "CvCompetence"("groupId", "competenceId");
CREATE TABLE "new_ProfileCompetence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competenceId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "ProfileCompetence_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "Competence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProfileCompetence_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProfileCompetenceGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProfileCompetence" ("competenceId", "groupId", "id") SELECT "competenceId", "groupId", "id" FROM "ProfileCompetence";
DROP TABLE "ProfileCompetence";
ALTER TABLE "new_ProfileCompetence" RENAME TO "ProfileCompetence";
CREATE UNIQUE INDEX "ProfileCompetence_groupId_competenceId_key" ON "ProfileCompetence"("groupId", "competenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
