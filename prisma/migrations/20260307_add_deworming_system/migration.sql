-- AlterEnum: Add DEWORMING to AppointmentType
ALTER TYPE "AppointmentType" ADD VALUE 'DEWORMING';

-- AlterEnum: Add DEWORMING_DUE to NotificationType
ALTER TYPE "NotificationType" ADD VALUE 'DEWORMING_DUE';

-- CreateTable: Deworming
CREATE TABLE "Deworming" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productType" TEXT,
    "manufacturer" TEXT,
    "dose" TEXT,
    "weight" DOUBLE PRECISION,
    "administeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextDueDate" TIMESTAMP(3),
    "nextDewormingType" TEXT,
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deworming_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deworming_patientId_idx" ON "Deworming"("patientId");

-- CreateIndex
CREATE INDEX "Deworming_nextDueDate_idx" ON "Deworming"("nextDueDate");

-- AddForeignKey
ALTER TABLE "Deworming" ADD CONSTRAINT "Deworming_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
