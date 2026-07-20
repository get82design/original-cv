/*
  Warnings:

  - A unique constraint covering the columns `[cvProjectId,order]` on the table `CvMissionProject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,order]` on the table `MissionProject` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CvMissionProject_cvProjectId_order_key" ON "public"."CvMissionProject"("cvProjectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MissionProject_projectId_order_key" ON "public"."MissionProject"("projectId", "order");
