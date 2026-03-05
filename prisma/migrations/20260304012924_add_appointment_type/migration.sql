/*
  Warnings:

  - You are about to drop the column `password` on the `Owner` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[portalToken]` on the table `Owner` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('CHECKUP', 'VACCINATION', 'SURGERY', 'EMERGENCY', 'GROOMING', 'DENTAL', 'LABORATORY', 'XRAY', 'FOLLOWUP', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Species" ADD VALUE 'HAMSTER';
ALTER TYPE "Species" ADD VALUE 'FISH';
ALTER TYPE "Species" ADD VALUE 'REPTILE';

-- AlterTable
ALTER TABLE "Owner" DROP COLUMN "password",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "portalToken" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "portalEnabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "deceasedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDeceased" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Owner_portalToken_key" ON "Owner"("portalToken");

-- CreateIndex
CREATE INDEX "Owner_phone_idx" ON "Owner"("phone");
