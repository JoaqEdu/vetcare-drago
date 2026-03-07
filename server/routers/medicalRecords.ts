import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { TreatmentStatus, AppointmentType } from "@prisma/client"
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

        // Follow-up tracking
        requiresFollowUp: z.boolean().default(false),
        treatmentStatus: z.nativeEnum(TreatmentStatus).optional(),
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

      // Si viene de una cita, verificar que no exista ya un expediente para esa cita
      if (input.appointmentId) {
        const existingRecord = await ctx.db.medicalRecord.findFirst({
          where: { appointmentId: input.appointmentId },
        })

        if (existingRecord) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ya existe un expediente médico para esta cita. No se permiten registros duplicados.",
          })
        }
      }

      // Determinar el estado del tratamiento
      let treatmentStatus = input.treatmentStatus

      // Si requiere seguimiento y no se especificó estado, marcar como ACTIVE
      if (input.requiresFollowUp && !treatmentStatus) {
        treatmentStatus = TreatmentStatus.ACTIVE
      }

      // Si NO requiere seguimiento, marcar como COMPLETED directamente
      if (!input.requiresFollowUp) {
        treatmentStatus = TreatmentStatus.COMPLETED
      }

      const record = await ctx.db.medicalRecord.create({
        data: {
          ...input,
          vetId,
          treatmentStatus,
        },
        include: {
          patient: true,
          vet: { select: { id: true, name: true } },
        },
      })

      // Si requiere seguimiento y hay fecha de seguimiento, crear cita automática
      if (input.requiresFollowUp && input.followUpDate && vetId) {
        try {
          // Verificar que el usuario existe antes de crear la cita
          const userExists = await ctx.db.user.findUnique({
            where: { id: vetId },
            select: { id: true }
          })

          if (userExists) {
            const appointmentType = input.diagnosis?.toLowerCase().includes("cirug")
              ? "SURGERY"
              : "FOLLOWUP"

            const notes = input.diagnosis
              ? `Seguimiento post-tratamiento - Diagnóstico: ${input.diagnosis}`
              : "Seguimiento post-tratamiento"

            await ctx.db.appointment.create({
              data: {
                patientId: input.patientId,
                vetId,
                scheduledAt: input.followUpDate,
                duration: 30,
                type: AppointmentType.FOLLOWUP,
                notes,
                parentRecordId: record.id,
              },
            })
          }
        } catch (error) {
          // Si falla la creación de la cita, no afecta el registro médico
          console.error("Error al crear cita automática de seguimiento:", error)
        }
      }

      return record
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

  // =========================
  // COMPLETE TREATMENT
  // =========================
  completeTreatment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.medicalRecord.findUnique({
        where: { id: input.id },
      })

      if (!record) {
        throw new Error("Expediente no encontrado")
      }

      if (!record.requiresFollowUp) {
        throw new Error("Este expediente no tiene seguimiento activo")
      }

      return ctx.db.medicalRecord.update({
        where: { id: input.id },
        data: {
          treatmentStatus: TreatmentStatus.COMPLETED,
        },
      })
    }),
})