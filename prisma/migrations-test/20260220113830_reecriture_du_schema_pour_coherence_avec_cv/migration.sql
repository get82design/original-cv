/*
  Warnings:

  - You are about to drop the column `achievementId` on the `CvAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `certificationId` on the `CvCertification` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionId` on the `CvDescription` table. All the data in the column will be lost.
  - You are about to drop the column `educationId` on the `CvEducation` table. All the data in the column will be lost.
  - You are about to drop the column `experienceId` on the `CvExperience` table. All the data in the column will be lost.
  - You are about to drop the column `expertiseId` on the `CvExpertise` table. All the data in the column will be lost.
  - You are about to drop the column `formationId` on the `CvFormation` table. All the data in the column will be lost.
  - You are about to drop the column `languageId` on the `CvLanguage` table. All the data in the column will be lost.
  - You are about to drop the column `passionId` on the `CvPassion` table. All the data in the column will be lost.
  - You are about to drop the column `philosophyId` on the `CvPhilosophy` table. All the data in the column will be lost.
  - You are about to drop the column `priceId` on the `CvPrice` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `CvProject` table. All the data in the column will be lost.
  - You are about to drop the column `publicationId` on the `CvPublication` table. All the data in the column will be lost.
  - You are about to drop the column `socialMediaId` on the `CvSocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `strengthId` on the `CvStrength` table. All the data in the column will be lost.
  - You are about to drop the column `volunteeringId` on the `CvVolunteering` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId,title]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Strength` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Volunteering` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CV` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvAchievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvCertification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `CvDescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degree` to the `CvEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school` to the `CvEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `CvEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `CvExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `CvExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `CvExpertise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvExpertise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `CvFormation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvFormation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `CvLanguage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CvLanguage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `CvPassion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvPassion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `citation` to the `CvPhilosophy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domaine` to the `CvPrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvPrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `CvProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `CvPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialNetwork` to the `CvSocialMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `CvSocialMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvStrength` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisation` to the `CvVolunteering` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `CvVolunteering` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CvVolunteering` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CvMissionExperience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "cvExperienceId" TEXT NOT NULL,
    CONSTRAINT "CvMissionExperience_cvExperienceId_fkey" FOREIGN KEY ("cvExperienceId") REFERENCES "CvExperience" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CvMissionVolunteering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "cvVolunteeringId" TEXT NOT NULL,
    CONSTRAINT "CvMissionVolunteering_cvVolunteeringId_fkey" FOREIGN KEY ("cvVolunteeringId") REFERENCES "CvVolunteering" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CvMissionProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "cvProjectId" TEXT NOT NULL,
    CONSTRAINT "CvMissionProject_cvProjectId_fkey" FOREIGN KEY ("cvProjectId") REFERENCES "CvProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CV" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photo" TEXT,
    "title" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CV_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CVTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CV" ("id", "photo", "templateId", "title", "userId") SELECT "id", "photo", "templateId", "title", "userId" FROM "CV";
DROP TABLE "CV";
ALTER TABLE "new_CV" RENAME TO "CV";
CREATE TABLE "new_CVModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    "settings" JSONB,
    CONSTRAINT "CVModule_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CVModule" ("cvId", "id", "order", "settings", "title", "type") SELECT "cvId", "id", "order", "settings", "title", "type" FROM "CVModule";
DROP TABLE "CVModule";
ALTER TABLE "new_CVModule" RENAME TO "CVModule";
CREATE UNIQUE INDEX "CVModule_cvId_order_key" ON "CVModule"("cvId", "order");
CREATE TABLE "new_CvAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER,
    "technology" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvAchievement_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvAchievement" ("cvId", "id") SELECT "cvId", "id" FROM "CvAchievement";
DROP TABLE "CvAchievement";
ALTER TABLE "new_CvAchievement" RENAME TO "CvAchievement";
CREATE UNIQUE INDEX "CvAchievement_cvId_title_key" ON "CvAchievement"("cvId", "title");
CREATE UNIQUE INDEX "CvAchievement_cvId_order_key" ON "CvAchievement"("cvId", "order");
CREATE TABLE "new_CvCertification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organismeCertification" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvCertification_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvCertification" ("cvId", "id") SELECT "cvId", "id" FROM "CvCertification";
DROP TABLE "CvCertification";
ALTER TABLE "new_CvCertification" RENAME TO "CvCertification";
CREATE UNIQUE INDEX "CvCertification_cvId_title_key" ON "CvCertification"("cvId", "title");
CREATE UNIQUE INDEX "CvCertification_cvId_order_key" ON "CvCertification"("cvId", "order");
CREATE TABLE "new_CvDescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvDescription_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvDescription" ("cvId", "id") SELECT "cvId", "id" FROM "CvDescription";
DROP TABLE "CvDescription";
ALTER TABLE "new_CvDescription" RENAME TO "CvDescription";
CREATE UNIQUE INDEX "CvDescription_cvId_key" ON "CvDescription"("cvId");
CREATE TABLE "new_CvEducation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "school" TEXT NOT NULL,
    "city" TEXT,
    "degree" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "obtained" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvEducation_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvEducation" ("cvId", "id") SELECT "cvId", "id" FROM "CvEducation";
DROP TABLE "CvEducation";
ALTER TABLE "new_CvEducation" RENAME TO "CvEducation";
CREATE UNIQUE INDEX "CvEducation_cvId_order_key" ON "CvEducation"("cvId", "order");
CREATE TABLE "new_CvExperience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "location" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvExperience_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvExperience" ("cvId", "id") SELECT "cvId", "id" FROM "CvExperience";
DROP TABLE "CvExperience";
ALTER TABLE "new_CvExperience" RENAME TO "CvExperience";
CREATE UNIQUE INDEX "CvExperience_cvId_title_key" ON "CvExperience"("cvId", "title");
CREATE UNIQUE INDEX "CvExperience_cvId_order_key" ON "CvExperience"("cvId", "order");
CREATE TABLE "new_CvExpertise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvExpertise_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvExpertise" ("cvId", "id") SELECT "cvId", "id" FROM "CvExpertise";
DROP TABLE "CvExpertise";
ALTER TABLE "new_CvExpertise" RENAME TO "CvExpertise";
CREATE UNIQUE INDEX "CvExpertise_cvId_title_key" ON "CvExpertise"("cvId", "title");
CREATE UNIQUE INDEX "CvExpertise_cvId_order_key" ON "CvExpertise"("cvId", "order");
CREATE TABLE "new_CvFormation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organismeFormation" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvFormation_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvFormation" ("cvId", "id") SELECT "cvId", "id" FROM "CvFormation";
DROP TABLE "CvFormation";
ALTER TABLE "new_CvFormation" RENAME TO "CvFormation";
CREATE UNIQUE INDEX "CvFormation_cvId_title_key" ON "CvFormation"("cvId", "title");
CREATE UNIQUE INDEX "CvFormation_cvId_order_key" ON "CvFormation"("cvId", "order");
CREATE TABLE "new_CvLanguage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvLanguage_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvLanguage" ("cvId", "id") SELECT "cvId", "id" FROM "CvLanguage";
DROP TABLE "CvLanguage";
ALTER TABLE "new_CvLanguage" RENAME TO "CvLanguage";
CREATE UNIQUE INDEX "CvLanguage_cvId_name_key" ON "CvLanguage"("cvId", "name");
CREATE UNIQUE INDEX "CvLanguage_cvId_order_key" ON "CvLanguage"("cvId", "order");
CREATE TABLE "new_CvPassion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvPassion_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvPassion" ("cvId", "id") SELECT "cvId", "id" FROM "CvPassion";
DROP TABLE "CvPassion";
ALTER TABLE "new_CvPassion" RENAME TO "CvPassion";
CREATE UNIQUE INDEX "CvPassion_cvId_title_key" ON "CvPassion"("cvId", "title");
CREATE UNIQUE INDEX "CvPassion_cvId_order_key" ON "CvPassion"("cvId", "order");
CREATE TABLE "new_CvPhilosophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "citation" TEXT NOT NULL,
    "author" TEXT,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvPhilosophy_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvPhilosophy" ("cvId", "id") SELECT "cvId", "id" FROM "CvPhilosophy";
DROP TABLE "CvPhilosophy";
ALTER TABLE "new_CvPhilosophy" RENAME TO "CvPhilosophy";
CREATE UNIQUE INDEX "CvPhilosophy_cvId_key" ON "CvPhilosophy"("cvId");
CREATE TABLE "new_CvPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "domaine" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvPrice_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvPrice" ("cvId", "id") SELECT "cvId", "id" FROM "CvPrice";
DROP TABLE "CvPrice";
ALTER TABLE "new_CvPrice" RENAME TO "CvPrice";
CREATE UNIQUE INDEX "CvPrice_cvId_title_key" ON "CvPrice"("cvId", "title");
CREATE UNIQUE INDEX "CvPrice_cvId_order_key" ON "CvPrice"("cvId", "order");
CREATE TABLE "new_CvProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "technology" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvProject_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvProject" ("cvId", "id") SELECT "cvId", "id" FROM "CvProject";
DROP TABLE "CvProject";
ALTER TABLE "new_CvProject" RENAME TO "CvProject";
CREATE UNIQUE INDEX "CvProject_cvId_title_key" ON "CvProject"("cvId", "title");
CREATE UNIQUE INDEX "CvProject_cvId_order_key" ON "CvProject"("cvId", "order");
CREATE TABLE "new_CvPublication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "journalName" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvPublication_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvPublication" ("cvId", "id") SELECT "cvId", "id" FROM "CvPublication";
DROP TABLE "CvPublication";
ALTER TABLE "new_CvPublication" RENAME TO "CvPublication";
CREATE UNIQUE INDEX "CvPublication_cvId_title_key" ON "CvPublication"("cvId", "title");
CREATE UNIQUE INDEX "CvPublication_cvId_order_key" ON "CvPublication"("cvId", "order");
CREATE TABLE "new_CvSocialMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socialNetwork" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvSocialMedia_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvSocialMedia" ("cvId", "id") SELECT "cvId", "id" FROM "CvSocialMedia";
DROP TABLE "CvSocialMedia";
ALTER TABLE "new_CvSocialMedia" RENAME TO "CvSocialMedia";
CREATE UNIQUE INDEX "CvSocialMedia_cvId_socialNetwork_key" ON "CvSocialMedia"("cvId", "socialNetwork");
CREATE UNIQUE INDEX "CvSocialMedia_cvId_order_key" ON "CvSocialMedia"("cvId", "order");
CREATE TABLE "new_CvStrength" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvStrength_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvStrength" ("cvId", "id") SELECT "cvId", "id" FROM "CvStrength";
DROP TABLE "CvStrength";
ALTER TABLE "new_CvStrength" RENAME TO "CvStrength";
CREATE UNIQUE INDEX "CvStrength_cvId_title_key" ON "CvStrength"("cvId", "title");
CREATE UNIQUE INDEX "CvStrength_cvId_order_key" ON "CvStrength"("cvId", "order");
CREATE TABLE "new_CvVolunteering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "description" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "location" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvVolunteering_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CvVolunteering" ("cvId", "id") SELECT "cvId", "id" FROM "CvVolunteering";
DROP TABLE "CvVolunteering";
ALTER TABLE "new_CvVolunteering" RENAME TO "CvVolunteering";
CREATE UNIQUE INDEX "CvVolunteering_cvId_title_key" ON "CvVolunteering"("cvId", "title");
CREATE UNIQUE INDEX "CvVolunteering_cvId_order_key" ON "CvVolunteering"("cvId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_profileId_title_key" ON "Achievement"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Experience_profileId_title_key" ON "Experience"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Strength_profileId_title_key" ON "Strength"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteering_profileId_title_key" ON "Volunteering"("profileId", "title");
