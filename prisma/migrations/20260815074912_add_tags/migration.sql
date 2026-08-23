/*
  Warnings:

  - Added the required column `icon` to the `CvSocialMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `SocialMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CVModuleItemType" ADD VALUE 'cvTagGroup';

-- AlterEnum
ALTER TYPE "CVModuleType" ADD VALUE 'tag';

-- AlterTable
ALTER TABLE "CvSocialMedia" ADD COLUMN     "icon" TEXT NOT NULL,
ALTER COLUMN "socialNetwork" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CvStrength" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "SocialMedia" ADD COLUMN     "icon" TEXT NOT NULL,
ALTER COLUMN "socialNetwork" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Strength" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileTagGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "ProfileTagGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileTag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "ProfileTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvTagGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "cvId" TEXT NOT NULL,

    CONSTRAINT "CvTagGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvTag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "CvTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileTagGroup_profileId_order_key" ON "ProfileTagGroup"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileTag_groupId_tagId_key" ON "ProfileTag"("groupId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileTag_groupId_order_key" ON "ProfileTag"("groupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvTagGroup_cvId_order_key" ON "CvTagGroup"("cvId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CvTag_groupId_tagId_key" ON "CvTag"("groupId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "CvTag_groupId_order_key" ON "CvTag"("groupId", "order");

-- AddForeignKey
ALTER TABLE "ProfileTagGroup" ADD CONSTRAINT "ProfileTagGroup_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileTag" ADD CONSTRAINT "ProfileTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileTag" ADD CONSTRAINT "ProfileTag_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProfileTagGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvTagGroup" ADD CONSTRAINT "CvTagGroup_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvTag" ADD CONSTRAINT "CvTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvTag" ADD CONSTRAINT "CvTag_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CvTagGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
