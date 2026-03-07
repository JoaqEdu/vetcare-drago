import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const laboratoryRouter = createTRPCRouter({

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
      return ctx.db.labResult.findMany({
        where: { patientId: input.patientId },
        orderBy: { sampleDate: "desc" },
        take: input.limit,
      })
    }),

  // =========================
  // GET BY ID
  // =========================
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.labResult.findUnique({
        where: { id: input.id },
        include: {
          patient: {
            include: { owner: true },
          },
        },
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resultado de laboratorio no encontrado",
        })
      }

      return result
    }),

  // =========================
  // CREATE
  // =========================
  create: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        appointmentId: z.string().optional(),
        testType: z.string().min(1),
        testName: z.string().optional(),
        results: z.string().min(1),
        interpretation: z.string().optional(),
        laboratory: z.string().optional(),
        referenceValues: z.string().optional(),
        attachmentUrl: z.string().optional(),
        sampleDate: z.date().optional(),
        resultDate: z.date().optional(),
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
        const existingLab = await ctx.db.labResult.findUnique({
          where: { appointmentId },
        })

        if (existingLab) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ya existe un registro de laboratorio vinculado a esta cita.",
          })
        }
      }

      return ctx.db.labResult.create({
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
        testType: z.string().optional(),
        testName: z.string().optional(),
        results: z.string().optional(),
        interpretation: z.string().optional(),
        laboratory: z.string().optional(),
        referenceValues: z.string().optional(),
        attachmentUrl: z.string().optional(),
        resultDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.labResult.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resultado de laboratorio no encontrado",
        })
      }

      return ctx.db.labResult.update({
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
      const existing = await ctx.db.labResult.findUnique({
        where: { id: input.id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resultado de laboratorio no encontrado",
        })
      }

      await ctx.db.labResult.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
