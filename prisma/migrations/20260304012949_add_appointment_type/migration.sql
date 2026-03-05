-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "type" "AppointmentType" NOT NULL DEFAULT 'CHECKUP';

-- CreateIndex
CREATE INDEX "Appointment_type_idx" ON "Appointment"("type");
