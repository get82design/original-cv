/*
  Warnings:

  - A unique constraint covering the columns `[groupId,order]` on the table `CvCompetence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,order]` on the table `CvSkill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,order]` on the table `ProfileCompetence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,order]` on the table `ProfileSkill` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."CvCompetence" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."CvSkill" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ProfileCompetence" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ProfileSkill" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "CvCompetence_groupId_order_key" ON "public"."CvCompetence"("groupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvSkill_groupId_order_key" ON "public"."CvSkill"("groupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileCompetence_groupId_order_key" ON "public"."ProfileCompetence"("groupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSkill_groupId_order_key" ON "public"."ProfileSkill"("groupId", "order");
