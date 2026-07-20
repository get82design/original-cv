-- AlterTable
ALTER TABLE "public"."CvMissionProject" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."MissionProject" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
