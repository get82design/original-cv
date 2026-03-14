/*
  Warnings:

  - A unique constraint covering the columns `[profileId,socialNetwork]` on the table `SocialMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_profileId_socialNetwork_key" ON "SocialMedia"("profileId", "socialNetwork");
