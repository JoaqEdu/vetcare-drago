import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import {
  AppointmentStatus,
  AppointmentType,
  UserRole,
} from "@prisma/client"

export const appointmentsRouter = createTRPCRouter({

  // =========================
  // LIST (con filtros + cursor)
  // =========================
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.nativeEnum(AppointmentStatus).optional(),
        type: z.nativeEnum(AppointmentType).optional(),
        vetId: z.string().optional(),
        date: z.date().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        search,
        status,
        type,
        vetId,
        date,
        startDate,
        endDate,
        limit,
        cursor,
      } = input

      // -------------------------
      // Filtro por fecha
      // -------------------------
      let dateFilter: { gte?: Date; lte?: Date } | undefined

      if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        dateFilter = { gte: startOfDay, lte: endOfDay }
      } else if (startDate || endDate) {
        dateFilter = {}
        if (startDate) dateFilter.gte = startDate
        if (endDate) dateFilter.lte = endDate
      }

      const appointments = await ctx.db.appointment.findMany({
        where: {
          ...(search && {
            OR: [
              { patient: { name: { contains: search, mode: "insensitive" } } },
              {
                patient: {
                  owner: {
                    firstName: { contains: search, mode: "insensitive" },
                  },
                },
              },
              {
                patient: {
                  owner: {
                    lastName: { contains: search, mode: "insensitive" },
                  },
                },
              },
              { reason: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(status && { status }),
          ...(type && { type }),
          ...(vetId && { vetId }),
          ...(dateFilter && { scheduledAt: dateFilter }),
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
          vet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined

      if (appointments.length > limit) {
        const nextItem = appointments.pop()
        nextCursor = nextItem!.id
      }

      return {
        appointments,
        nextCursor,
      }
    }),

  // =========================
  // GET BY ID
  // =========================
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.appointment.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          patient: {
            include: {
              owner: true,
            },
          },
          vet: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    }),

  // =========================
  // GET TODAY
  // =========================
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date()

    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    return ctx.db.appointment.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
            owner: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        vet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    })
  }),

  // =========================
  // CREATE
  // =========================
  create: protectedProcedure
    .input(
      z.object({
        scheduledAt: z.date(),
        duration: z.number().min(15).max(480).default(30),
        reason: z.string().optional(),
        notes: z.string().optional(),
        type: z.nativeEnum(AppointmentType).default(
          AppointmentType.CHECKUP
        ),
        patientId: z.string(),
        vetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { id: input.patientId },
      })

      if (!patient) {
        throw new Error("Paciente no encontrado")
      }

      const vet = await ctx.db.user.findUnique({
        where: { id: input.vetId },
      })

      if (!vet) {
        throw new Error("Veterinario no encontrado")
      }

      return ctx.db.appointment.create({
        data: input,
        include: {
          patient: {
            include: {
              owner: true,
            },
          },
          vet: true,
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
        scheduledAt: z.date().optional(),
        duration: z.number().min(15).max(480).optional(),
        status: z.nativeEnum(AppointmentStatus).optional(),
        type: z.nativeEnum(AppointmentType).optional(),
        reason: z.string().optional(),
        notes: z.string().optional(),
        vetId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      if (data.vetId) {
        const vet = await ctx.db.user.findUnique({
          where: { id: data.vetId },
        })

        if (!vet) {
          throw new Error("Veterinario no encontrado")
        }
      }

      return ctx.db.appointment.update({
        where: { id },
        data,
      })
    }),

  // =========================
  // UPDATE STATUS
  // =========================
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(AppointmentStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const updateData: Record<string, unknown> = {
        status: input.status,
      }

      if (input.status === AppointmentStatus.CONFIRMED) {
        updateData.confirmedAt = new Date()
      }

      const appointment = await ctx.db.appointment.update({
        where: {
          id: input.id,
        },
        data: updateData,
      })

      return appointment
    }),

  // =========================
  // DELETE
  // =========================
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appointment.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // =========================
  // GET VETS
  // =========================
  getVets: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      where: {
        role: {
          in: [UserRole.VET, UserRole.ADMIN],
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    })
  }),
})