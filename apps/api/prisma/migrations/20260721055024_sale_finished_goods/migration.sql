-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_lotId_fkey";

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "finishedLotId" TEXT,
ALTER COLUMN "lotId" DROP NOT NULL,
ALTER COLUMN "length" DROP NOT NULL,
ALTER COLUMN "width" DROP NOT NULL,
ALTER COLUMN "thickness" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "SaleItem_finishedLotId_idx" ON "SaleItem"("finishedLotId");

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_finishedLotId_fkey" FOREIGN KEY ("finishedLotId") REFERENCES "FinishedGoodsLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
