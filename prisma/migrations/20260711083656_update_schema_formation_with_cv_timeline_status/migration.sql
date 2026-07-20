/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CVTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."CvTimelineStatus" AS ENUM ('COMPLETED', 'ABANDONED', 'INTERRUPTED');

-- AlterTable
ALTER TABLE "public"."CvFormation" ADD COLUMN     "status" "public"."CvTimelineStatus";

-- AlterTable
ALTER TABLE "public"."CvHeader" ALTER COLUMN "subtitle" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "portfolio" DROP NOT NULL,
ALTER COLUMN "nom" DROP NOT NULL,
ALTER COLUMN "prenom" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CVTemplate_name_key" ON "public"."CVTemplate"("name");
