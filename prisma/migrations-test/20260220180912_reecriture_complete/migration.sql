/*
  Warnings:

  - A unique constraint covering the columns `[cvId,title]` on the table `CvEducation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Education` will be added. If there are existing duplicate values, this will fail.

*/
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
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "publicSlug" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "pdfUrl" TEXT,
    "pdfVersion" INTEGER NOT NULL DEFAULT 0,
    "pdfGeneratedAt" DATETIME,
    CONSTRAINT "CV_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CVTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CV" ("createdAt", "id", "photo", "templateId", "title", "updatedAt", "userId") SELECT "createdAt", "id", "photo", "templateId", "title", "updatedAt", "userId" FROM "CV";
DROP TABLE "CV";
ALTER TABLE "new_CV" RENAME TO "CV";
CREATE UNIQUE INDEX "CV_publicSlug_key" ON "CV"("publicSlug");
CREATE INDEX "CV_userId_idx" ON "CV"("userId");
CREATE INDEX "CV_templateId_idx" ON "CV"("templateId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Achievement_profileId_idx" ON "Achievement"("profileId");

-- CreateIndex
CREATE INDEX "CVModule_cvId_idx" ON "CVModule"("cvId");

-- CreateIndex
CREATE INDEX "CVModuleItem_moduleId_idx" ON "CVModuleItem"("moduleId");

-- CreateIndex
CREATE INDEX "CVModuleItem_itemType_itemId_idx" ON "CVModuleItem"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "Certification_profileId_idx" ON "Certification"("profileId");

-- CreateIndex
CREATE INDEX "CvAchievement_cvId_idx" ON "CvAchievement"("cvId");

-- CreateIndex
CREATE INDEX "CvCertification_cvId_idx" ON "CvCertification"("cvId");

-- CreateIndex
CREATE INDEX "CvEducation_cvId_idx" ON "CvEducation"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvEducation_cvId_title_key" ON "CvEducation"("cvId", "title");

-- CreateIndex
CREATE INDEX "CvExperience_cvId_idx" ON "CvExperience"("cvId");

-- CreateIndex
CREATE INDEX "CvExpertise_cvId_idx" ON "CvExpertise"("cvId");

-- CreateIndex
CREATE INDEX "CvFormation_cvId_idx" ON "CvFormation"("cvId");

-- CreateIndex
CREATE INDEX "CvHeader_cvId_idx" ON "CvHeader"("cvId");

-- CreateIndex
CREATE INDEX "CvLanguage_cvId_idx" ON "CvLanguage"("cvId");

-- CreateIndex
CREATE INDEX "CvMissionExperience_cvExperienceId_idx" ON "CvMissionExperience"("cvExperienceId");

-- CreateIndex
CREATE INDEX "CvMissionProject_cvProjectId_idx" ON "CvMissionProject"("cvProjectId");

-- CreateIndex
CREATE INDEX "CvMissionVolunteering_cvVolunteeringId_idx" ON "CvMissionVolunteering"("cvVolunteeringId");

-- CreateIndex
CREATE INDEX "CvPassion_cvId_idx" ON "CvPassion"("cvId");

-- CreateIndex
CREATE INDEX "CvPrice_cvId_idx" ON "CvPrice"("cvId");

-- CreateIndex
CREATE INDEX "CvProject_cvId_idx" ON "CvProject"("cvId");

-- CreateIndex
CREATE INDEX "CvPublication_cvId_idx" ON "CvPublication"("cvId");

-- CreateIndex
CREATE INDEX "CvSocialMedia_cvId_idx" ON "CvSocialMedia"("cvId");

-- CreateIndex
CREATE INDEX "CvStrength_cvId_idx" ON "CvStrength"("cvId");

-- CreateIndex
CREATE INDEX "CvVolunteering_cvId_idx" ON "CvVolunteering"("cvId");

-- CreateIndex
CREATE INDEX "Education_profileId_idx" ON "Education"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Education_profileId_title_key" ON "Education"("profileId", "title");

-- CreateIndex
CREATE INDEX "Experience_profileId_idx" ON "Experience"("profileId");

-- CreateIndex
CREATE INDEX "Expertise_profileId_idx" ON "Expertise"("profileId");

-- CreateIndex
CREATE INDEX "Formation_profileId_idx" ON "Formation"("profileId");

-- CreateIndex
CREATE INDEX "Language_profileId_idx" ON "Language"("profileId");

-- CreateIndex
CREATE INDEX "MissionExperience_experienceId_idx" ON "MissionExperience"("experienceId");

-- CreateIndex
CREATE INDEX "MissionProject_projectId_idx" ON "MissionProject"("projectId");

-- CreateIndex
CREATE INDEX "MissionVolunteering_volunteeringId_idx" ON "MissionVolunteering"("volunteeringId");

-- CreateIndex
CREATE INDEX "Passion_profileId_idx" ON "Passion"("profileId");

-- CreateIndex
CREATE INDEX "Price_profileId_idx" ON "Price"("profileId");

-- CreateIndex
CREATE INDEX "Project_profileId_idx" ON "Project"("profileId");

-- CreateIndex
CREATE INDEX "Publication_profileId_idx" ON "Publication"("profileId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "SocialMedia_profileId_idx" ON "SocialMedia"("profileId");

-- CreateIndex
CREATE INDEX "Strength_profileId_idx" ON "Strength"("profileId");

-- CreateIndex
CREATE INDEX "Volunteering_profileId_idx" ON "Volunteering"("profileId");
