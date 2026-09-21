-- CreateTable
CREATE TABLE "ApiErrorEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "ApiErrorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiErrorEvent_createdAt_idx" ON "ApiErrorEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ApiErrorEvent_code_createdAt_idx" ON "ApiErrorEvent"("code", "createdAt");

-- CreateIndex
CREATE INDEX "ApiErrorEvent_path_createdAt_idx" ON "ApiErrorEvent"("path", "createdAt");

-- CreateIndex
CREATE INDEX "ApiErrorEvent_userId_idx" ON "ApiErrorEvent"("userId");

-- AddForeignKey
ALTER TABLE "ApiErrorEvent" ADD CONSTRAINT "ApiErrorEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
