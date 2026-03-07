-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "alternatePhone" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "chipNumber" TEXT;
