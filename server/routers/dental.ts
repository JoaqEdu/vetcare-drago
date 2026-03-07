import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { AppointmentType } from "@prisma/client"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const dentalRouter = createTRPCRouter({

  // =========================
  // LIST
  // =========================
  list: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.dentalRecord.findMany({
        where: { patientId: input.patientId },
        orderBy: { performedAt: "desc" },
        take: input.limit,
      })
    }),

  // =========================
  // GET BY ID
  // =========================
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.dentalRecord.findUnique({
        where: { id: input.id },
        include: {
          patient: {
            include: { owner: true },
          },
        },
      })

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registro dental no encontrado",
        })
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
        procedure: z.string().min(1),
        teethAffected: z.string().optional(),
        findings: z.string().optional(),
        treatment: z.string().optional(),
        anesthesia: z.boolean().default(false),
        nextCheckup: z.date().optional(),
        notes: z.string().optional(),
        performedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Obtener userId de la sesión
      const userId = ctx.session?.user?.id
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuario no autenticado",
        })
      }

      const { appointmentId, ...restData } = input

      const patient = await ctx.db.patient.findUnique({
        where: { id: input.patientId },
      })

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente no encontrado",
        })
      }

      // Si viene de una cita, verificar que no exista ya un registro para ESA cita específica
      if (appointmentId) {
        const existingDental = await ctx.db.dentalRecord.findUnique({
          where: { appointmentId },
        })

        if (existingDental) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ya existe un registro dental vinculado a esta cita.",
          })
        }
      }

      const dentalRecord = await ctx.db.dentalRecord.create({
        data: {
          ...restData,
          appointmentId,
        },
      })

      // Si hay nextCheckup, crear automáticamente cita de chequeo dental
      if (restData.nextCheckup) {
        // Verificar que el veterinario existe
        const vet = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { id: true },
        })

        if (vet) {
          const notes = restData.procedure
            ? `Chequeo dental de seguimiento - Procedimiento anterior: ${restData.procedure}`
            : "Chequeo dental de seguimiento"

          await ctx.db.appointment.create({
            data: {
              patientId: input.patientId,
              vetId: vet.id,
              scheduledAt: restData.nextCheckup,
              duration: 30,
              type: AppointmentType.DENTAL,
              notes,
            },
          })
        }
      }

      return dentalRecord
    }),

  // =========================
  // UPDATE
  // =========================
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        procedure: z.string().optional(),
        teethAffected: z.string().optional(),
        findings: z.string().optional(),
        treatment: z.string().optional(),
        anesthesia: z.boolean().optional(),
        nextCheckup: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.dentalRecord.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registro dental no encontrado",
        })
      }

      return ctx.db.dentalRecord.update({
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
      const existing = await ctx.db.dentalRecord.findUnique({
        where: { id: input.id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registro dental no encontrado",
        })
      }

      await ctx.db.dentalRecord.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
