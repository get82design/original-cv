/*
  Warnings:

  - A unique constraint covering the columns `[profileId,order]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CVModule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvCompetenceGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvSkillGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Education` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Expertise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Formation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Passion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `ProfileCompetenceGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `ProfileSkillGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Publication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `SocialMedia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Strength` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Volunteering` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Achievement_profileId_order_key" ON "Achievement"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CVModule_cvId_order_key" ON "CVModule"("cvId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvCompetenceGroup_cvId_order_key" ON "CvCompetenceGroup"("cvId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvSkillGroup_cvId_order_key" ON "CvSkillGroup"("cvId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Education_profileId_order_key" ON "Education"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Experience_profileId_order_key" ON "Experience"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Expertise_profileId_order_key" ON "Expertise"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_profileId_order_key" ON "Formation"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Language_profileId_order_key" ON "Language"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Passion_profileId_order_key" ON "Passion"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileCompetenceGroup_profileId_order_key" ON "ProfileCompetenceGroup"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSkillGroup_profileId_order_key" ON "ProfileSkillGroup"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Project_profileId_order_key" ON "Project"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_profileId_order_key" ON "Publication"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_profileId_order_key" ON "SocialMedia"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Strength_profileId_order_key" ON "Strength"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteering_profileId_order_key" ON "Volunteering"("profileId", "order");
