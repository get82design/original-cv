/*
  Warnings:

  - A unique constraint covering the columns `[cvId,column,order]` on the table `CVModule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CVModule_cvId_order_key";

-- AlterTable
ALTER TABLE "CVModule" ADD COLUMN     "column" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "CVModule_cvId_column_order_key" ON "CVModule"("cvId", "column", "order");
