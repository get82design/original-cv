/*
  Warnings:

  - A unique constraint covering the columns `[profileId,title]` on the table `Certification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Certification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Formation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,title]` on the table `Price` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,order]` on the table `Price` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Certification_profileId_title_key" ON "Certification"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_profileId_order_key" ON "Certification"("profileId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_profileId_title_key" ON "Formation"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Price_profileId_title_key" ON "Price"("profileId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Price_profileId_order_key" ON "Price"("profileId", "order");
