/*
  Warnings:

  - A unique constraint covering the columns `[cvId,type]` on the table `CVModule` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."CVModuleType" ADD VALUE 'strength';
ALTER TYPE "public"."CVModuleType" ADD VALUE 'socialMedia';

-- AlterTable
ALTER TABLE "public"."CV" ADD COLUMN     "layoutGeneral" JSONB;

-- AlterTable
ALTER TABLE "public"."CVModule" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "CVModule_cvId_type_key" ON "public"."CVModule"("cvId", "type");
