-- CreateEnum
CREATE TYPE "AdminCreditKind" AS ENUM ('DOWNLOAD_CREDITS', 'FREE_DOWNLOADS');

-- CreateEnum
CREATE TYPE "AdminCreditReason" AS ENUM ('ADMIN_SET', 'ADMIN_SOFT_RESET');

-- CreateTable
CREATE TABLE "AdminCreditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" "AdminCreditKind" NOT NULL,
    "reason" "AdminCreditReason" NOT NULL,
    "delta" INTEGER NOT NULL,
    "before" INTEGER NOT NULL,
    "after" INTEGER NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "actorUserId" TEXT,

    CONSTRAINT "AdminCreditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminCreditLog_createdAt_idx" ON "AdminCreditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminCreditLog_kind_createdAt_idx" ON "AdminCreditLog"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "AdminCreditLog_targetUserId_createdAt_idx" ON "AdminCreditLog"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminCreditLog_actorUserId_createdAt_idx" ON "AdminCreditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "AdminCreditLog" ADD CONSTRAINT "AdminCreditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminCreditLog" ADD CONSTRAINT "AdminCreditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
