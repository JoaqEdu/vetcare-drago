-- CreateEnum
CREATE TYPE "TreatmentStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "treatmentStatus" "TreatmentStatus";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "parentRecordId" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_parentRecordId_idx" ON "Appointment"("parentRecordId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_parentRecordId_fkey" FOREIGN KEY ("parentRecordId") REFERENCES "MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
