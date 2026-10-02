-- AlterEnum
ALTER TYPE "CVModuleType" ADD VALUE 'stat';

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvStat" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "settings" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "cvId" TEXT NOT NULL,

    CONSTRAINT "CvStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stat_profileId_idx" ON "Stat"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Stat_profileId_label_key" ON "Stat"("profileId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "Stat_profileId_order_key" ON "Stat"("profileId", "order");

-- CreateIndex
CREATE INDEX "CvStat_cvId_idx" ON "CvStat"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "CvStat_cvId_label_key" ON "CvStat"("cvId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "CvStat_cvId_order_key" ON "CvStat"("cvId", "order");

-- AddForeignKey
ALTER TABLE "Stat" ADD CONSTRAINT "Stat_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvStat" ADD CONSTRAINT "CvStat_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
