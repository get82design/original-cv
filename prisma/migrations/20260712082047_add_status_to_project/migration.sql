-- AlterTable
ALTER TABLE "public"."CvProject" ADD COLUMN     "status" "public"."CvTimelineStatus";

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "status" "public"."CvTimelineStatus";
