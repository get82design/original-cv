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
  - A unique constraint covering the columns `[publicSlug]` on the table `CV` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CVModule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Certification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Certification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvAchievement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvAchievement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvCertification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvCertification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvCompetenceGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvEducation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvEducation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvExperience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvExperience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvExpertise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvExpertise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvFormation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvFormation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,name]` on the table `CvLanguage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvLanguage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvPassion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvPassion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvPrice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvPrice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvProject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvProject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvPublication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvPublication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvSkillGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,socialNetwork]` on the table `CvSocialMedia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvSocialMedia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvStrength` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvStrength` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,title]` on the table `CvVolunteering` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cvId,order]` on the table `CvVolunteering` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Education` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Education` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Expertise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Expertise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Formation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Formation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,name]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Passion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Passion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Price` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Price` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `ProfileCompetenceGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `ProfileSkillGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Publication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Publication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,socialNetwork]` on the table `SocialMedia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `SocialMedia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Strength` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Strength` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Volunteering` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Volunteering` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CV` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `CVModule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `itemType` on the `CVModuleItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
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
-- CreateEnum
CREATE TYPE "public"."CVStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."CVModuleItemType" AS ENUM ('cvSkillGroup', 'cvExperience', 'cvEducation', 'cvProject', 'cvVolunteering', 'cvPublication', 'cvAchievement', 'cvExpertise', 'cvFormation', 'cvCertification', 'cvPrice', 'cvLanguage', 'cvPassion', 'cvCompetenceGroup', 'cvDescription');

-- CreateEnum
CREATE TYPE "public"."CVModuleType" AS ENUM ('skill', 'experience', 'education', 'project', 'volunteering', 'publication', 'achievement', 'expertise', 'formation', 'certification', 'price', 'language', 'passion', 'competence', 'description');

-- DropForeignKey
ALTER TABLE "public"."CVModule" DROP CONSTRAINT "CVModule_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Certification" DROP CONSTRAINT "Certification_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvAchievement" DROP CONSTRAINT "CvAchievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvCertification" DROP CONSTRAINT "CvCertification_certificationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvDescription" DROP CONSTRAINT "CvDescription_descriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvEducation" DROP CONSTRAINT "CvEducation_educationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvExperience" DROP CONSTRAINT "CvExperience_experienceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvExpertise" DROP CONSTRAINT "CvExpertise_expertiseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvFormation" DROP CONSTRAINT "CvFormation_formationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvLanguage" DROP CONSTRAINT "CvLanguage_languageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvPassion" DROP CONSTRAINT "CvPassion_passionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvPhilosophy" DROP CONSTRAINT "CvPhilosophy_philosophyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvPrice" DROP CONSTRAINT "CvPrice_priceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvProject" DROP CONSTRAINT "CvProject_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvPublication" DROP CONSTRAINT "CvPublication_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvSocialMedia" DROP CONSTRAINT "CvSocialMedia_socialMediaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvStrength" DROP CONSTRAINT "CvStrength_strengthId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvVolunteering" DROP CONSTRAINT "CvVolunteering_volunteeringId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Education" DROP CONSTRAINT "Education_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Expertise" DROP CONSTRAINT "Expertise_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Formation" DROP CONSTRAINT "Formation_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Language" DROP CONSTRAINT "Language_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Passion" DROP CONSTRAINT "Passion_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Publication" DROP CONSTRAINT "Publication_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SocialMedia" DROP CONSTRAINT "SocialMedia_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Volunteering" DROP CONSTRAINT "Volunteering_profileId_fkey";

-- DropIndex
DROP INDEX "public"."CvDescription_descriptionId_key";

-- DropIndex
DROP INDEX "public"."CvPhilosophy_philosophyId_key";

-- AlterTable
ALTER TABLE "public"."CV" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pdfGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "pdfVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publicSlug" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."CVStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."CVModule" DROP COLUMN "type",
ADD COLUMN     "type" "public"."CVModuleType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."CVModuleItem" DROP COLUMN "itemType",
ADD COLUMN     "itemType" "public"."CVModuleItemType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvAchievement" DROP COLUMN "achievementId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "technology" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "public"."CvCertification" DROP COLUMN "certificationId",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "organismeCertification" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvDescription" DROP COLUMN "descriptionId",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvEducation" DROP COLUMN "educationId",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "degree" TEXT NOT NULL,
ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "obtained" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "school" TEXT NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "public"."CvExperience" DROP COLUMN "experienceId",
ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvExpertise" DROP COLUMN "expertiseId",
ADD COLUMN     "level" "public"."Level" NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvFormation" DROP COLUMN "formationId",
ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "organismeFormation" TEXT,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvLanguage" DROP COLUMN "languageId",
ADD COLUMN     "level" "public"."Level" NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."CvPassion" DROP COLUMN "passionId",
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvPhilosophy" DROP COLUMN "philosophyId",
ADD COLUMN     "author" TEXT,
ADD COLUMN     "citation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvPrice" DROP COLUMN "priceId",
ADD COLUMN     "domaine" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvProject" DROP COLUMN "projectId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "technology" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvPublication" DROP COLUMN "publicationId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "journalName" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "public"."CvSocialMedia" DROP COLUMN "socialMediaId",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "socialNetwork" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvStrength" DROP COLUMN "strengthId",
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CvVolunteering" DROP COLUMN "volunteeringId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "organisation" TEXT NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."CvMissionExperience" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cvExperienceId" TEXT NOT NULL,

    CONSTRAINT "CvMissionExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CvMissionVolunteering" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cvVolunteeringId" TEXT NOT NULL,

    CONSTRAINT "CvMissionVolunteering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CvMissionProject" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cvProjectId" TEXT NOT NULL,

    CONSTRAINT "CvMissionProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CvMissionExperience_cvExperienceId_idx" ON "public"."CvMissionExperience"("cvExperienceId");

-- CreateIndex
CREATE INDEX "CvMissionVolunteering_cvVolunteeringId_idx" ON "public"."CvMissionVolunteering"("cvVolunteeringId");

-- CreateIndex
CREATE INDEX "CvMissionProject_cvProjectId_idx" ON "public"."CvMissionProject"("cvProjectId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CV_publicSlug_key" ON "public"."CV"("publicSlug");

-- CreateIndex
CREATE INDEX "CV_userId_idx" ON "public"."CV"("userId");

-- CreateIndex
CREATE INDEX "CV_templateId_idx" ON "public"."CV"("templateId");

-- CreateIndex
CREATE INDEX "CVModule_cvId_idx" ON "public"."CVModule"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CVModule_cvId_order_key" ON "public"."CVModule"("cvId", "order");

-- CreateIndex
CREATE INDEX "CVModuleItem_moduleId_idx" ON "public"."CVModuleItem"("moduleId");

-- CreateIndex
CREATE INDEX "CVModuleItem_itemType_itemId_idx" ON "public"."CVModuleItem"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "Certification_profileId_idx" ON "public"."Certification"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_profileId_title_key" ON "public"."Certification"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_profileId_order_key" ON "public"."Certification"("profileId", "order");

-- CreateIndex
CREATE INDEX "CvAchievement_cvId_idx" ON "public"."CvAchievement"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvAchievement_cvId_order_key" ON "public"."CvAchievement"("cvId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvAchievement_cvId_title_key" ON "public"."CvAchievement"("cvId", "title");

-- CreateIndex
CREATE INDEX "CvCertification_cvId_idx" ON "public"."CvCertification"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvCertification_cvId_title_key" ON "public"."CvCertification"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvCertification_cvId_order_key" ON "public"."CvCertification"("cvId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvCompetenceGroup_cvId_order_key" ON "public"."CvCompetenceGroup"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvEducation_cvId_idx" ON "public"."CvEducation"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvEducation_cvId_title_key" ON "public"."CvEducation"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvEducation_cvId_order_key" ON "public"."CvEducation"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvExperience_cvId_idx" ON "public"."CvExperience"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvExperience_cvId_title_key" ON "public"."CvExperience"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvExperience_cvId_order_key" ON "public"."CvExperience"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvExpertise_cvId_idx" ON "public"."CvExpertise"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvExpertise_cvId_title_key" ON "public"."CvExpertise"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvExpertise_cvId_order_key" ON "public"."CvExpertise"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvFormation_cvId_idx" ON "public"."CvFormation"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvFormation_cvId_title_key" ON "public"."CvFormation"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvFormation_cvId_order_key" ON "public"."CvFormation"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvHeader_cvId_idx" ON "public"."CvHeader"("cvId");

-- CreateIndex
CREATE INDEX "CvLanguage_cvId_idx" ON "public"."CvLanguage"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvLanguage_cvId_name_key" ON "public"."CvLanguage"("cvId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CvLanguage_cvId_order_key" ON "public"."CvLanguage"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvPassion_cvId_idx" ON "public"."CvPassion"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvPassion_cvId_title_key" ON "public"."CvPassion"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvPassion_cvId_order_key" ON "public"."CvPassion"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvPrice_cvId_idx" ON "public"."CvPrice"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvPrice_cvId_title_key" ON "public"."CvPrice"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvPrice_cvId_order_key" ON "public"."CvPrice"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvProject_cvId_idx" ON "public"."CvProject"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvProject_cvId_title_key" ON "public"."CvProject"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvProject_cvId_order_key" ON "public"."CvProject"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvPublication_cvId_idx" ON "public"."CvPublication"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvPublication_cvId_title_key" ON "public"."CvPublication"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvPublication_cvId_order_key" ON "public"."CvPublication"("cvId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvSkillGroup_cvId_order_key" ON "public"."CvSkillGroup"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvSocialMedia_cvId_idx" ON "public"."CvSocialMedia"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvSocialMedia_cvId_socialNetwork_key" ON "public"."CvSocialMedia"("cvId", "socialNetwork");

-- CreateIndex
CREATE UNIQUE INDEX "CvSocialMedia_cvId_order_key" ON "public"."CvSocialMedia"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvStrength_cvId_idx" ON "public"."CvStrength"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvStrength_cvId_title_key" ON "public"."CvStrength"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvStrength_cvId_order_key" ON "public"."CvStrength"("cvId", "order");

-- CreateIndex
CREATE INDEX "CvVolunteering_cvId_idx" ON "public"."CvVolunteering"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvVolunteering_cvId_title_key" ON "public"."CvVolunteering"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvVolunteering_cvId_order_key" ON "public"."CvVolunteering"("cvId", "order");

-- CreateIndex
CREATE INDEX "Education_profileId_idx" ON "public"."Education"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Education_profileId_title_key" ON "public"."Education"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Education_profileId_order_key" ON "public"."Education"("profileId", "order");

-- CreateIndex
CREATE INDEX "Experience_profileId_idx" ON "public"."Experience"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Experience_profileId_title_key" ON "public"."Experience"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Experience_profileId_order_key" ON "public"."Experience"("profileId", "order");

-- CreateIndex
CREATE INDEX "Expertise_profileId_idx" ON "public"."Expertise"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Expertise_profileId_title_key" ON "public"."Expertise"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Expertise_profileId_order_key" ON "public"."Expertise"("profileId", "order");

-- CreateIndex
CREATE INDEX "Formation_profileId_idx" ON "public"."Formation"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_profileId_title_key" ON "public"."Formation"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_profileId_order_key" ON "public"."Formation"("profileId", "order");

-- CreateIndex
CREATE INDEX "Language_profileId_idx" ON "public"."Language"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_profileId_name_key" ON "public"."Language"("profileId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_profileId_order_key" ON "public"."Language"("profileId", "order");

-- CreateIndex
CREATE INDEX "MissionExperience_experienceId_idx" ON "public"."MissionExperience"("experienceId");

-- CreateIndex
CREATE INDEX "MissionProject_projectId_idx" ON "public"."MissionProject"("projectId");

-- CreateIndex
CREATE INDEX "MissionVolunteering_volunteeringId_idx" ON "public"."MissionVolunteering"("volunteeringId");

-- CreateIndex
CREATE INDEX "Passion_profileId_idx" ON "public"."Passion"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Passion_profileId_title_key" ON "public"."Passion"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Passion_profileId_order_key" ON "public"."Passion"("profileId", "order");

-- CreateIndex
CREATE INDEX "Price_profileId_idx" ON "public"."Price"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_profileId_title_key" ON "public"."Price"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Price_profileId_order_key" ON "public"."Price"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileCompetenceGroup_profileId_order_key" ON "public"."ProfileCompetenceGroup"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSkillGroup_profileId_order_key" ON "public"."ProfileSkillGroup"("profileId", "order");

-- CreateIndex
CREATE INDEX "Project_profileId_idx" ON "public"."Project"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_profileId_title_key" ON "public"."Project"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Project_profileId_order_key" ON "public"."Project"("profileId", "order");

-- CreateIndex
CREATE INDEX "Publication_profileId_idx" ON "public"."Publication"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_profileId_title_key" ON "public"."Publication"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_profileId_order_key" ON "public"."Publication"("profileId", "order");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "SocialMedia_profileId_idx" ON "public"."SocialMedia"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_profileId_socialNetwork_key" ON "public"."SocialMedia"("profileId", "socialNetwork");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_profileId_order_key" ON "public"."SocialMedia"("profileId", "order");

-- CreateIndex
CREATE INDEX "Strength_profileId_idx" ON "public"."Strength"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Strength_profileId_title_key" ON "public"."Strength"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Strength_profileId_order_key" ON "public"."Strength"("profileId", "order");

-- CreateIndex
CREATE INDEX "Volunteering_profileId_idx" ON "public"."Volunteering"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteering_profileId_title_key" ON "public"."Volunteering"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteering_profileId_order_key" ON "public"."Volunteering"("profileId", "order");

-- AddForeignKey
ALTER TABLE "public"."CvMissionExperience" ADD CONSTRAINT "CvMissionExperience_cvExperienceId_fkey" FOREIGN KEY ("cvExperienceId") REFERENCES "public"."CvExperience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Volunteering" ADD CONSTRAINT "Volunteering_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CvMissionVolunteering" ADD CONSTRAINT "CvMissionVolunteering_cvVolunteeringId_fkey" FOREIGN KEY ("cvVolunteeringId") REFERENCES "public"."CvVolunteering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CvMissionProject" ADD CONSTRAINT "CvMissionProject_cvProjectId_fkey" FOREIGN KEY ("cvProjectId") REFERENCES "public"."CvProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Publication" ADD CONSTRAINT "Publication_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Language" ADD CONSTRAINT "Language_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Passion" ADD CONSTRAINT "Passion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialMedia" ADD CONSTRAINT "SocialMedia_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expertise" ADD CONSTRAINT "Expertise_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certification" ADD CONSTRAINT "Certification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Formation" ADD CONSTRAINT "Formation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CVModule" ADD CONSTRAINT "CVModule_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
