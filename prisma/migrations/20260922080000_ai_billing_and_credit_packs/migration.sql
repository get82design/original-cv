-- CreateEnum
CREATE TYPE "AiPaymentMethod" AS ENUM ('FREE', 'PAID');

-- AlterEnum
ALTER TYPE "AiFeature" ADD VALUE 'COVER_LETTER';

-- AlterTable
ALTER TABLE "AiEvent" ADD COLUMN "paymentMethod" "AiPaymentMethod",
ADD COLUMN "creditsSpent" INTEGER;

-- CreateTable
CREATE TABLE "AiFeaturePrice" (
    "feature" "AiFeature" NOT NULL,
    "costFree" INTEGER,
    "costPaid" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiFeaturePrice_pkey" PRIMARY KEY ("feature")
);

-- CreateTable
CREATE TABLE "CreditPack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "downloadCredits" INTEGER NOT NULL,
    "freeDownloads" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditPack_isActive_sortOrder_idx" ON "CreditPack"("isActive", "sortOrder");
