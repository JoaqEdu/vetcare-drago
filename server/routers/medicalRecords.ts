import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const medicalRecordsRouter = createTRPCRouter({

  // =========================
  // LIST BY PATIENT
  // =========================
  list: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { patientId, limit, cursor } = input

      const records = await ctx.db.medicalRecord.findMany({
        where: { patientId },
        include: {
          vet: { select: { id: true, name: true } },
        },
        orderBy: { visitDate: "desc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined

      if (records.length > limit) {
        const nextItem = records.pop()
        nextCursor = nextItem!.id
      }

      return { records, nextCursor }
    }),

  // =========================
  // GET BY ID
  // =========================
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.medicalRecord.findUnique({
        where: { id: input.id },
        include: {
          patient: {
            include: {
              owner: true,
            },
          },
          vet: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      if (!record) {
        throw new Error("Expediente no encontrado")
      }

      return record
    }),

  // =========================
  // CREATE
  // =========================
  create: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        appointmentId: z.string().optional(),

        chiefComplaint: z.string().optional(),
        presentIllness: z.string().optional(),

        weight: z.number().optional(),
        temperature: z.number().optional(),
        heartRate: z.number().optional(),
        respiratoryRate: z.number().optional(),

        diagnosis: z.string().optional(),
        differentialDx: z.string().optional(),
        prognosis: z.string().optional(),

        treatment: z.string().optional(),
        recommendations: z.string().optional(),
        followUpDate: z.date().optional(),

        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const vetId = ctx.session?.user?.id

      if (!vetId) {
        throw new Error("Usuario no autenticado")
      }

      const patient = await ctx.db.patient.findUnique({
        where: { id: input.patientId },
      })

      if (!patient) {
        throw new Error("Paciente no encontrado")
      }

      return ctx.db.medicalRecord.create({
        data: {
          ...input,
          vetId,
        },
        include: {
          patient: true,
          vet: { select: { id: true, name: true } },
        },
      })
    }),

  // =========================
  // UPDATE
  // =========================
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),

        chiefComplaint: z.string().optional(),
        presentIllness: z.string().optional(),

        weight: z.number().optional(),
        temperature: z.number().optional(),
        heartRate: z.number().optional(),
        respiratoryRate: z.number().optional(),

        diagnosis: z.string().optional(),
        differentialDx: z.string().optional(),
        prognosis: z.string().optional(),

        treatment: z.string().optional(),
        recommendations: z.string().optional(),
        followUpDate: z.date().optional(),

        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const { id, ...data } = input

      const record = await ctx.db.medicalRecord.findUnique({
        where: { id },
      })

      if (!record) {
        throw new Error("Expediente no encontrado")
      }

      return ctx.db.medicalRecord.update({
        where: { id },
        data,
      })
    }),

  // =========================
  // DELETE
  // =========================
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {

      const record = await ctx.db.medicalRecord.findUnique({
        where: { id: input.id },
      })

      if (!record) {
        throw new Error("Expediente no encontrado")
      }

      await ctx.db.medicalRecord.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})