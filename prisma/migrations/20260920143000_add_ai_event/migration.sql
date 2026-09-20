-- CreateEnum
CREATE TYPE "AiFeature" AS ENUM ('IMPORT_CV', 'REVIEW_CV', 'REWRITE_SECTION');

-- CreateTable
CREATE TABLE "AiEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feature" "AiFeature" NOT NULL,
    "detail" TEXT,
    "userId" TEXT,

    CONSTRAINT "AiEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiEvent_createdAt_idx" ON "AiEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AiEvent_feature_createdAt_idx" ON "AiEvent"("feature", "createdAt");

-- CreateIndex
CREATE INDEX "AiEvent_userId_idx" ON "AiEvent"("userId");

-- AddForeignKey
ALTER TABLE "AiEvent" ADD CONSTRAINT "AiEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
