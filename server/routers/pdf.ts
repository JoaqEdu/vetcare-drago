import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { generateMedicalRecordPDF } from "@/lib/pdf/generators/medical-record"
import { format } from "date-fns"

export const pdfRouter = createTRPCRouter({
  // PDF de expediente médico individual
  generateMedicalRecord: protectedProcedure
    .input(z.object({ recordId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.medicalRecord.findUniqueOrThrow({
        where: { id: input.recordId },
        include: {
          patient: { include: { owner: true } },
          vet: true,
        },
      })

      const pdfBuffer = await generateMedicalRecordPDF(record)

      return {
        pdf: pdfBuffer.toString("base64"),
        filename: `expediente-${record.patient.name}-${format(
          record.visitDate,
          "yyyy-MM-dd"
        )}.pdf`,
      }
    }),
})
