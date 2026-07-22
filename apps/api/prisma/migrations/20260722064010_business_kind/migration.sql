-- CreateEnum
CREATE TYPE "BusinessKind" AS ENUM ('WOOD_ONLY', 'LUMBER_ONLY', 'BOTH');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "kind" "BusinessKind" NOT NULL DEFAULT 'BOTH';
