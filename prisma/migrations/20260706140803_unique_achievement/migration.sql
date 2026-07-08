/*
  Warnings:

  - A unique constraint covering the columns `[profileId,title]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Achievement_profileId_idx" ON "public"."Achievement"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_profileId_title_key" ON "public"."Achievement"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_profileId_order_key" ON "public"."Achievement"("profileId", "order");
