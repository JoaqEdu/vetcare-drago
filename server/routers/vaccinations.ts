import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { AppointmentType } from "@prisma/client"
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
        appointmentId: z.string().optional(),
        vaccineName: z.string().min(1),
        vaccineType: z.string().optional(),
        manufacturer: z.string().optional(),
        batchNumber: z.string().optional(),
        administeredAt: z.date().optional(),
        nextDueDate: z.date().optional(),
        nextVaccineName: z.string().optional(),
        isBooster: z.boolean().default(false),
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
        const existingVaccination = await ctx.db.vaccination.findUnique({
          where: { appointmentId },
        })

        if (existingVaccination) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ya existe un registro de vacuna vinculado a esta cita.",
          })
        }
      }

      const vaccination = await ctx.db.vaccination.create({
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

      // Si hay nextDueDate, crear automáticamente cita de vacunación
      if (vaccination.nextDueDate) {
        // Verificar que el veterinario existe
        const vet = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { id: true },
        })

        if (vet) {
          let nextVaccineName: string | undefined
          let notes = ""

          if (vaccination.nextVaccineName) {
            nextVaccineName = vaccination.nextVaccineName
            notes = `Vacuna programada - Vacuna anterior: ${vaccination.vaccineName}`
          } else if (vaccination.isBooster) {
            nextVaccineName = `${vaccination.vaccineName} (Refuerzo)`
            notes = `Refuerzo programado`
          } else {
            notes = `Siguiente dosis - Vacuna anterior: ${vaccination.vaccineName}`
          }

          await ctx.db.appointment.create({
            data: {
              patientId: vaccination.patientId,
              vetId: vet.id,
              scheduledAt: vaccination.nextDueDate,
              duration: 30,
              type: AppointmentType.VACCINATION,
              vaccineName: nextVaccineName,
              notes,
            },
          })
        }
      }

      return vaccination
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