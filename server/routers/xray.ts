import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const xrayRouter = createTRPCRouter({

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
      return ctx.db.xRayRecord.findMany({
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
      const record = await ctx.db.xRayRecord.findUnique({
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
          message: "Registro de rayos X no encontrado",
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
        bodyPart: z.string().min(1),
        views: z.string().optional(),
        findings: z.string().min(1),
        diagnosis: z.string().optional(),
        imageUrl: z.string().optional(),
        notes: z.string().optional(),
        performedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { appointmentId, ...data } = input

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
        const existingXRay = await ctx.db.xRayRecord.findUnique({
          where: { appointmentId },
        })

        if (existingXRay) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ya existe un registro de rayos X vinculado a esta cita.",
          })
        }
      }

      return ctx.db.xRayRecord.create({
        data: {
          ...data,
          appointmentId,
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
        bodyPart: z.string().optional(),
        views: z.string().optional(),
        findings: z.string().optional(),
        diagnosis: z.string().optional(),
        imageUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.xRayRecord.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registro de rayos X no encontrado",
        })
      }

      return ctx.db.xRayRecord.update({
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
      const existing = await ctx.db.xRayRecord.findUnique({
        where: { id: input.id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registro de rayos X no encontrado",
        })
      }

      await ctx.db.xRayRecord.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
