/*
  Warnings:

  - A unique constraint covering the columns `[profileId,title]` on the table `Publication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Publication_profileId_title_key" ON "Publication"("profileId", "title");
