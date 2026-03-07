import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { AppointmentType } from "@prisma/client"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const dewormingsRouter = createTRPCRouter({

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

      const dewormings = await ctx.db.deworming.findMany({
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

      return dewormings
    }),

  // =========================
  // GET BY ID
  // =========================
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const deworming = await ctx.db.deworming.findUnique({
        where: { id: input.id },
        include: {
          patient: {
            include: { owner: true },
          },
        },
      })

      if (!deworming) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Desparasitación no encontrada",
        })
      }

      return deworming
    }),

  // =========================
  // COUNT UPCOMING
  // =========================
  getUpcomingCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.deworming.count({
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
        appointmentId: z.string().optional(),
        productName: z.string().min(1),
        productType: z.string().optional(),
        manufacturer: z.string().optional(),
        dose: z.string().optional(),
        weight: z.number().optional(),
        administeredAt: z.date().optional(),
        nextDueDate: z.date().optional(),
        nextDewormingType: z.string().optional(),
        notes: z.string().optional(),
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

      const { patientId, appointmentId, ...data } = input

      const patient = await ctx.db.patient.findUnique({
        where: { id: patientId },
      })

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente no encontrado",
        })
      }

      // Si viene de una cita, verificar que no exista ya un registro para ESA cita específica
      if (appointmentId) {
        const existingDeworming = await ctx.db.deworming.findUnique({
          where: { appointmentId },
        })

        if (existingDeworming) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ya existe un registro de desparasitación vinculado a esta cita.",
          })
        }
      }

      const deworming = await ctx.db.deworming.create({
        data: {
          ...data,
          patientId,
          appointmentId,
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              owner: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      })

      // Si hay nextDueDate, crear automáticamente cita de desparasitación
      if (deworming.nextDueDate) {
        // Verificar que el veterinario existe
        const vet = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { id: true },
        })

        if (vet) {
          const productInfo = deworming.nextDewormingType
            ? deworming.nextDewormingType
            : `Desparasitación - Producto anterior: ${deworming.productName}`

          await ctx.db.appointment.create({
            data: {
              patientId: deworming.patientId,
              vetId: vet.id,
              scheduledAt: deworming.nextDueDate,
              duration: 15,
              type: AppointmentType.DEWORMING,
              notes: productInfo,
            },
          })
        }
      }

      return deworming
    }),

  // =========================
  // UPDATE
  // =========================
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        productName: z.string().min(1).optional(),
        productType: z.string().optional(),
        manufacturer: z.string().optional(),
        dose: z.string().optional(),
        weight: z.number().optional(),
        nextDueDate: z.date().optional(),
        nextDewormingType: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.deworming.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Desparasitación no encontrada",
        })
      }

      return ctx.db.deworming.update({
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
      const existing = await ctx.db.deworming.findUnique({
        where: { id: input.id },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Desparasitación no encontrada",
        })
      }

      await ctx.db.deworming.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
