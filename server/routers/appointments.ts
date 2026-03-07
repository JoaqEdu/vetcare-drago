import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import {
  AppointmentStatus,
  AppointmentType,
  UserRole,
  Prisma,
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
              { patient: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
              {
                patient: {
                  owner: {
                    firstName: { contains: search, mode: Prisma.QueryMode.insensitive },
                  },
                },
              },
              {
                patient: {
                  owner: {
                    lastName: { contains: search, mode: Prisma.QueryMode.insensitive },
                  },
                },
              },
              { reason: { contains: search, mode: Prisma.QueryMode.insensitive } },
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
          // Incluir registros vinculados directamente
          medicalRecord: { select: { id: true } },
          vaccination: { select: { id: true } },
          deworming: { select: { id: true } },
          dentalRecord: { select: { id: true } },
          labResult: { select: { id: true } },
          xrayRecord: { select: { id: true } },
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

      // Determinar hasRecord basado en relaciones directas
      const appointmentsWithRecordStatus = appointments.map((apt) => {
        let hasRecord = false

        switch (apt.type) {
          case "CHECKUP":
          case "SURGERY":
          case "EMERGENCY":
          case "FOLLOWUP":
          case "OTHER":
            hasRecord = !!apt.medicalRecord
            break
          case "VACCINATION":
            hasRecord = !!apt.vaccination
            break
          case "DEWORMING":
            hasRecord = !!apt.deworming
            break
          case "DENTAL":
            hasRecord = !!apt.dentalRecord
            break
          case "LABORATORY":
            hasRecord = !!apt.labResult
            break
          case "XRAY":
            hasRecord = !!apt.xrayRecord
            break
          case "GROOMING":
            // Las citas de estética no requieren registro
            hasRecord = true
            break
        }

        return {
          ...apt,
          hasRecord,
        }
      })

      return {
        appointments: appointmentsWithRecordStatus,
        nextCursor,
      }
    }),

  // =========================
  // LIST PAGINATED (Offset-based pagination)
  // =========================
  listPaginated: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.nativeEnum(AppointmentStatus).optional(),
        type: z.nativeEnum(AppointmentType).optional(),
        vetId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        search,
        status,
        type,
        vetId,
        startDate,
        endDate,
        page,
        pageSize,
      } = input

      const skip = (page - 1) * pageSize

      // Date filter
      let dateFilter: { gte?: Date; lte?: Date } | undefined
      if (startDate || endDate) {
        dateFilter = {}
        if (startDate) dateFilter.gte = startDate
        if (endDate) dateFilter.lte = endDate
      }

      const where = {
        ...(search && {
          OR: [
            { patient: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            {
              patient: {
                owner: {
                  firstName: { contains: search, mode: Prisma.QueryMode.insensitive },
                },
              },
            },
            {
              patient: {
                owner: {
                  lastName: { contains: search, mode: Prisma.QueryMode.insensitive },
                },
              },
            },
            { reason: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }),
        ...(status && { status }),
        ...(type && { type }),
        ...(vetId && { vetId }),
        ...(dateFilter && { scheduledAt: dateFilter }),
      }

      const [appointments, total] = await Promise.all([
        ctx.db.appointment.findMany({
          where,
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
          orderBy: { scheduledAt: "desc" },
          skip,
          take: pageSize,
        }),
        ctx.db.appointment.count({ where }),
      ])

      return {
        appointments,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
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
  // GET BY DATE RANGE (para calendario)
  // =========================
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        vetId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.appointment.findMany({
        where: {
          scheduledAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
          ...(input.vetId && { vetId: input.vetId }),
        },
        include: {
          patient: {
            include: { owner: true },
          },
          vet: {
            select: { name: true },
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
        // Campos para vacunación
        vaccineName: z.string().optional(),
        vaccineType: z.string().optional(),
        vaccineManufacturer: z.string().optional(),
        // Vinculación a expediente médico (para seguimientos)
        parentRecordId: z.string().optional(),
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
        // Campos para vacunación
        vaccineName: z.string().optional(),
        vaccineType: z.string().optional(),
        vaccineManufacturer: z.string().optional(),
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