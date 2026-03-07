import { renderToBuffer } from "@react-pdf/renderer"
import { MedicalRecordPDF } from "../templates/medical-record-template"

export async function generateMedicalRecordPDF(record: any) {
  const pdf = MedicalRecordPDF({ record, patient: record.patient })
  const buffer = await renderToBuffer(pdf)
  return buffer
}
