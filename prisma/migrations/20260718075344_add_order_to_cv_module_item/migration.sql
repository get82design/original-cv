/*
  Warnings:

  - A unique constraint covering the columns `[moduleId,order]` on the table `CVModuleItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moduleId,itemType,itemId]` on the table `CVModuleItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."CVModuleItem" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "CVModuleItem_moduleId_order_key" ON "public"."CVModuleItem"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CVModuleItem_moduleId_itemType_itemId_key" ON "public"."CVModuleItem"("moduleId", "itemType", "itemId");
