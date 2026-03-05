import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const vaccinationsRouter = createTRPCRouter({

  // =========================
  // LIST
  // =========================
  list: protectedProcedure
    .input(
      z.object({
        patientId: z.string().optional(),
        upcoming: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { patientId, upcoming, limit } = input

      const vaccinations = await ctx.db.vaccination.findMany({
        where: {
          ...(patientId && { patientId }),
          ...(upcoming && {
            nextDueDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            },
          }),
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              species: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: upcoming
          ? { nextDueDate: "asc" }
          : { administeredAt: "desc" },
        take: limit,
      })

      return vaccinations
    }),

  // =========================
  // GET BY ID
  // =========================
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vaccination = await ctx.db.vaccination.findUnique({
        where: { id: input.id },
        include: {
          patient: {
            include: { owner: true },
          },
        },
      })

      if (!vaccination) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vacuna no encontrada",
        })
      }

      return vaccination
    }),

  // =========================
  // COUNT UPCOMING
  // =========================
  getUpcomingCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.vaccination.count({
      where: {
        nextDueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    return count
  }),

  // =========================
  // CREATE
  // =========================
  create: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        vaccineName: z.string().min(1),
        vaccineType: z.string().optional(),
        manufacturer: z.string().optional(),
        batchNumber: z.string().optional(),
        administeredAt: z.date().optional(),
        nextDueDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { patientId, ...data } = input

      const patient = await ctx.db.patient.findUnique({
        where: { id: patientId },
      })

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente no encontrado",
        })
      }

      return ctx.db.vaccination.create({
        data: {
          ...data,
          patientId,
        },
        include: {
          patient: true,
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
        vaccineName: z.string().min(1).optional(),
        vaccineType: z.string().optional(),
        manufacturer: z.string().optional(),
        batchNumber: z.string().optional(),
        nextDueDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.vaccination.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vacuna no encontrada",
        })
      }

      return ctx.db.vaccination.update({
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
      const existing = await ctx.db.vaccination.findUnique({
        where: { id: input.id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vacuna no encontrada",
        })
      }

      await ctx.db.vaccination.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})