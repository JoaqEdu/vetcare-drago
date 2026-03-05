/*
  Warnings:

  - You are about to drop the column `notes` on the `MedicalRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[appointmentId]` on the table `MedicalRecord` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REMINDER', 'VACCINATION_DUE', 'LOW_STOCK', 'INVOICE_OVERDUE', 'GENERAL');

-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "notes",
ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "chiefComplaint" TEXT,
ADD COLUMN     "differentialDx" TEXT,
ADD COLUMN     "followUpDate" TIMESTAMP(3),
ADD COLUMN     "heartRate" INTEGER,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "presentIllness" TEXT,
ADD COLUMN     "prognosis" TEXT,
ADD COLUMN     "recommendations" TEXT,
ADD COLUMN     "respiratoryRate" INTEGER,
ADD COLUMN     "temperature" DOUBLE PRECISION,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "patientId" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "Vaccination" ADD COLUMN     "vaccineType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_appointmentId_key" ON "MedicalRecord"("appointmentId");

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");

-- CreateIndex
CREATE INDEX "MedicalRecord_vetId_idx" ON "MedicalRecord"("vetId");

-- CreateIndex
CREATE INDEX "MedicalRecord_visitDate_idx" ON "MedicalRecord"("visitDate");

-- CreateIndex
CREATE INDEX "Vaccination_patientId_idx" ON "Vaccination"("patientId");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
