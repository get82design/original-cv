/*
  Warnings:

  - The `obtained` column on the `CvEducation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `obtained` column on the `Education` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."CvEducation" DROP COLUMN "obtained",
ADD COLUMN     "obtained" "public"."CvTimelineStatus";

-- AlterTable
ALTER TABLE "public"."Education" DROP COLUMN "obtained",
ADD COLUMN     "obtained" "public"."CvTimelineStatus";

-- AlterTable
ALTER TABLE "public"."Formation" ADD COLUMN     "status" "public"."CvTimelineStatus";
