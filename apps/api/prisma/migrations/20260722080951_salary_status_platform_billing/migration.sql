-- CreateEnum
CREATE TYPE "SalaryStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "freeAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SalaryPayment" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "status" "SalaryStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "PlatformPayment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "amountUzs" DECIMAL(18,2) NOT NULL,
    "months" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "receiptUrl" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformPayment_businessId_status_idx" ON "PlatformPayment"("businessId", "status");

-- AddForeignKey
ALTER TABLE "PlatformPayment" ADD CONSTRAINT "PlatformPayment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
