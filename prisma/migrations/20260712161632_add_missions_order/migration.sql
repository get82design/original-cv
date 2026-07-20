/*
  Warnings:

  - A unique constraint covering the columns `[cvExperienceId,order]` on the table `CvMissionExperience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvVolunteeringId,order]` on the table `CvMissionVolunteering` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[experienceId,order]` on the table `MissionExperience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[volunteeringId,order]` on the table `MissionVolunteering` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."CvMissionExperience" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."CvMissionVolunteering" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."MissionExperience" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."MissionVolunteering" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "CvMissionExperience_cvExperienceId_order_key" ON "public"."CvMissionExperience"("cvExperienceId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvMissionVolunteering_cvVolunteeringId_order_key" ON "public"."CvMissionVolunteering"("cvVolunteeringId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MissionExperience_experienceId_order_key" ON "public"."MissionExperience"("experienceId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MissionVolunteering_volunteeringId_order_key" ON "public"."MissionVolunteering"("volunteeringId", "order");
