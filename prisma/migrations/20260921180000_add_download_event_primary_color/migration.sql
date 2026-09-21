-- AlterTable
ALTER TABLE "DownloadEvent" ADD COLUMN "primaryColorName" TEXT;

-- CreateIndex
CREATE INDEX "DownloadEvent_primaryColorName_createdAt_idx" ON "DownloadEvent"("primaryColorName", "createdAt");
