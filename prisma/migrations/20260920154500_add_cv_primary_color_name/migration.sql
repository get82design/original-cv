-- AlterTable
ALTER TABLE "CV" ADD COLUMN "primaryColorName" TEXT;

-- CreateIndex
CREATE INDEX "CV_primaryColorName_idx" ON "CV"("primaryColorName");
