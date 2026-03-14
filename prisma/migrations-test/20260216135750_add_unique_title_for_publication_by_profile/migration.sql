/*
  Warnings:

  - A unique constraint covering the columns `[profileId,title]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_profileId_title_key" ON "Project"("profileId", "title");
