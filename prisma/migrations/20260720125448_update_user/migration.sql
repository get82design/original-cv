/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PlanRole" AS ENUM ('FREE', 'STANDARD', 'PREMIUM', 'PREMIUM_PLUS_IA');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "downloadCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "iaRequestsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastIaReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "maxCvs" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "plan" "public"."PlanRole" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "subscriptionEnd" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."UnlockedTemplate" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UnlockedTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnlockedTemplate_userId_templateId_key" ON "public"."UnlockedTemplate"("userId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "User_customerId_key" ON "public"."User"("customerId");

-- AddForeignKey
ALTER TABLE "public"."UnlockedTemplate" ADD CONSTRAINT "UnlockedTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."CVTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnlockedTemplate" ADD CONSTRAINT "UnlockedTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
