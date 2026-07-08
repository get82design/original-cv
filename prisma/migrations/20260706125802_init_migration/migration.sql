/*
  Warnings:

  - You are about to drop the column `level` on the `CvCompetence` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `ProfileCompetence` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Achievement" DROP CONSTRAINT "Achievement_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CvEducation" DROP CONSTRAINT "CvEducation_educationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Experience" DROP CONSTRAINT "Experience_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Strength" DROP CONSTRAINT "Strength_profileId_fkey";

-- AlterTable
ALTER TABLE "public"."CvCompetence" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "public"."ProfileCompetence" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "public"."Strength" ALTER COLUMN "icon" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Experience" ADD CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CvEducation" ADD CONSTRAINT "CvEducation_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Achievement" ADD CONSTRAINT "Achievement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Strength" ADD CONSTRAINT "Strength_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
