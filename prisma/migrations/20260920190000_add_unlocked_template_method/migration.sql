-- CreateEnum
CREATE TYPE "UnlockMethod" AS ENUM ('GIFT', 'CREDITS', 'STRIPE');

-- AlterTable
ALTER TABLE "UnlockedTemplate" ADD COLUMN "method" "UnlockMethod" NOT NULL DEFAULT 'GIFT';

-- CreateIndex
CREATE INDEX "UnlockedTemplate_unlockedAt_idx" ON "UnlockedTemplate"("unlockedAt");

-- CreateIndex
CREATE INDEX "UnlockedTemplate_method_idx" ON "UnlockedTemplate"("method");
