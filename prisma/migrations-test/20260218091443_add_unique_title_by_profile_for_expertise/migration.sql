/*
  Warnings:

  - A unique constraint covering the columns `[profileId,title]` on the table `Expertise` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Expertise_profileId_title_key" ON "Expertise"("profileId", "title");
