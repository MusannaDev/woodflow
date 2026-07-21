-- AlterTable
ALTER TABLE "DefectRecord" ADD COLUMN     "quantity" INTEGER;

-- AlterTable
ALTER TABLE "InventoryLot" ADD COLUMN     "quantityRemaining" INTEGER;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "quantity" INTEGER;
