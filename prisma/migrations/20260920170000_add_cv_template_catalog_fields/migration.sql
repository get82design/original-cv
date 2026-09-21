-- AlterTable: catalogue templates (actif, premium, prix, featured, cadeaux)
ALTER TABLE "CVTemplate" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CVTemplate" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CVTemplate" ADD COLUMN "priceCents" INTEGER;
ALTER TABLE "CVTemplate" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CVTemplate" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CVTemplate" ADD COLUMN "unlockGifts" JSONB;

-- CreateIndex
CREATE INDEX "CVTemplate_isActive_sortOrder_idx" ON "CVTemplate"("isActive", "sortOrder");
CREATE INDEX "CVTemplate_isPremium_idx" ON "CVTemplate"("isPremium");
