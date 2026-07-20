/*
  Warnings:

  - The values [cvPrice] on the enum `CVModuleItemType` will be removed. If these variants are still used in the database, this will fail.
  - The values [price] on the enum `CVModuleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `CvPrice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CVModuleItemType_new" AS ENUM ('cvSkillGroup', 'cvExperience', 'cvEducation', 'cvProject', 'cvVolunteering', 'cvPublication', 'cvAchievement', 'cvExpertise', 'cvFormation', 'cvCertification', 'cvPrize', 'cvLanguage', 'cvPassion', 'cvCompetenceGroup', 'cvDescription');
ALTER TABLE "public"."CVModuleItem" ALTER COLUMN "itemType" TYPE "public"."CVModuleItemType_new" USING ("itemType"::text::"public"."CVModuleItemType_new");
ALTER TYPE "public"."CVModuleItemType" RENAME TO "CVModuleItemType_old";
ALTER TYPE "public"."CVModuleItemType_new" RENAME TO "CVModuleItemType";
DROP TYPE "public"."CVModuleItemType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."CVModuleType_new" AS ENUM ('skill', 'experience', 'education', 'project', 'volunteering', 'publication', 'achievement', 'expertise', 'formation', 'certification', 'prize', 'language', 'passion', 'competence', 'description');
ALTER TABLE "public"."CVModule" ALTER COLUMN "type" TYPE "public"."CVModuleType_new" USING ("type"::text::"public"."CVModuleType_new");
ALTER TYPE "public"."CVModuleType" RENAME TO "CVModuleType_old";
ALTER TYPE "public"."CVModuleType_new" RENAME TO "CVModuleType";
DROP TYPE "public"."CVModuleType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."CvPrice" DROP CONSTRAINT "CvPrice_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_profileId_fkey";

-- DropTable
DROP TABLE "public"."CvPrice";

-- DropTable
DROP TABLE "public"."Price";

-- CreateTable
CREATE TABLE "public"."Prize" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domaine" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CvPrize" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domaine" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,

    CONSTRAINT "CvPrize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prize_profileId_idx" ON "public"."Prize"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Prize_profileId_title_key" ON "public"."Prize"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Prize_profileId_order_key" ON "public"."Prize"("profileId", "order");

-- CreateIndex
CREATE INDEX "CvPrize_cvId_idx" ON "public"."CvPrize"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvPrize_cvId_title_key" ON "public"."CvPrize"("cvId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CvPrize_cvId_order_key" ON "public"."CvPrize"("cvId", "order");

-- AddForeignKey
ALTER TABLE "public"."Prize" ADD CONSTRAINT "Prize_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CvPrize" ADD CONSTRAINT "CvPrize_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
