-- CreateTable: DentalRecord
CREATE TABLE "DentalRecord" (
    "id" TEXT NOT NULL,
    "procedure" TEXT NOT NULL,
    "teethAffected" TEXT,
    "findings" TEXT,
    "treatment" TEXT,
    "anesthesia" BOOLEAN NOT NULL DEFAULT false,
    "nextCheckup" TIMESTAMP(3),
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DentalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LabResult
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "testName" TEXT,
    "results" TEXT NOT NULL,
    "interpretation" TEXT,
    "laboratory" TEXT,
    "referenceValues" TEXT,
    "attachmentUrl" TEXT,
    "patientId" TEXT NOT NULL,
    "sampleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable: XRayRecord
CREATE TABLE "XRayRecord" (
    "id" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "views" TEXT,
    "findings" TEXT NOT NULL,
    "diagnosis" TEXT,
    "imageUrl" TEXT,
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XRayRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DentalRecord_patientId_idx" ON "DentalRecord"("patientId");

-- CreateIndex
CREATE INDEX "LabResult_patientId_idx" ON "LabResult"("patientId");

-- CreateIndex
CREATE INDEX "XRayRecord_patientId_idx" ON "XRayRecord"("patientId");

-- AddForeignKey
ALTER TABLE "DentalRecord" ADD CONSTRAINT "DentalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XRayRecord" ADD CONSTRAINT "XRayRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
