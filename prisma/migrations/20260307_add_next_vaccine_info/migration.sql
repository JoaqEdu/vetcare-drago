-- AlterTable
ALTER TABLE "Vaccination" ADD COLUMN "nextVaccineName" TEXT,
ADD COLUMN "isBooster" BOOLEAN NOT NULL DEFAULT false;
