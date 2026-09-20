-- CreateEnum
CREATE TYPE "DownloadVariant" AS ENUM ('WITH_LOGO', 'WITHOUT_LOGO');

-- CreateTable
CREATE TABLE "DownloadEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "variant" "DownloadVariant" NOT NULL,
    "hadAccount" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "cvId" TEXT,
    "templateId" TEXT,

    CONSTRAINT "DownloadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DownloadEvent_createdAt_idx" ON "DownloadEvent"("createdAt");

-- CreateIndex
CREATE INDEX "DownloadEvent_variant_createdAt_idx" ON "DownloadEvent"("variant", "createdAt");

-- CreateIndex
CREATE INDEX "DownloadEvent_userId_idx" ON "DownloadEvent"("userId");

-- CreateIndex
CREATE INDEX "DownloadEvent_cvId_idx" ON "DownloadEvent"("cvId");

-- AddForeignKey
ALTER TABLE "DownloadEvent" ADD CONSTRAINT "DownloadEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadEvent" ADD CONSTRAINT "DownloadEvent_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE SET NULL ON UPDATE CASCADE;
