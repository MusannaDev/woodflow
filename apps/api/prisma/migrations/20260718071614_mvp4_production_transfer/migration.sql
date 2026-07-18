-- AlterEnum
ALTER TYPE "PurchaseSource" ADD VALUE 'INTERNAL_TRANSFER';

-- AlterTable
ALTER TABLE "ProductionBatch" ADD COLUMN     "inputLotId" TEXT;

-- CreateTable
CREATE TABLE "FinishedGoodsLot" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchId" TEXT,
    "quantityRemaining" INTEGER NOT NULL,
    "unitCostUzsPerPiece" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinishedGoodsLot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinishedGoodsLot_batchId_key" ON "FinishedGoodsLot"("batchId");

-- CreateIndex
CREATE INDEX "FinishedGoodsLot_workspaceId_idx" ON "FinishedGoodsLot"("workspaceId");

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_inputLotId_fkey" FOREIGN KEY ("inputLotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGoodsLot" ADD CONSTRAINT "FinishedGoodsLot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGoodsLot" ADD CONSTRAINT "FinishedGoodsLot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGoodsLot" ADD CONSTRAINT "FinishedGoodsLot_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
