import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { Species, Gender, Prisma } from "@prisma/client"

export const patientsRouter = createTRPCRouter({

  // =========================
  // LIST (Cursor-based pagination)
  // =========================
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        species: z.nativeEnum(Species).optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, species, limit, cursor } = input

      const patients = await ctx.db.patient.findMany({
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { owner: { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
              { owner: { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            ],
          }),
          ...(species && { species }),
          isActive: true,
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined = undefined

      if (patients.length > limit) {
        const nextItem = patients.pop()
        nextCursor = nextItem!.id
      }

      return {
        patients,
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
        species: z.nativeEnum(Species).optional(),
        isActive: z.boolean().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, species, isActive, page, pageSize } = input
      const skip = (page - 1) * pageSize

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { owner: { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { owner: { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { chipNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }),
        ...(species && { species }),
        ...(isActive !== undefined && { isActive }),
      }

      const [patients, total] = await Promise.all([
        ctx.db.patient.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
            _count: {
              select: {
                appointments: true,
                medicalRecords: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        ctx.db.patient.count({ where }),
      ])

      return {
        patients,
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
    .output(z.object({
      id: z.string(),
      name: z.string(),
      species: z.nativeEnum(Species),
      breed: z.string().nullable(),
      gender: z.nativeEnum(Gender),
      birthDate: z.date().nullable(),
      weight: z.number().nullable(),
      color: z.string().nullable(),
      notes: z.string().nullable(),
      isActive: z.boolean(),
      isDeceased: z.boolean(),
      deceasedAt: z.date().nullable(),
      ownerId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      owner: z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().nullable(),
        phone: z.string(),
        address: z.string().nullable(),
      }),
      medicalRecords: z.array(z.object({
        id: z.string(),
        visitDate: z.date(),
        chiefComplaint: z.string().nullable(),
        diagnosis: z.string().nullable(),
        createdAt: z.date(),
      })),
      vaccinations: z.array(z.object({
        id: z.string(),
        vaccineName: z.string(),
        administeredAt: z.date(),
        nextDueDate: z.date().nullable(),
      })),
      appointments: z.array(z.object({
        id: z.string(),
        scheduledAt: z.date(),
        status: z.enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELED", "NO_SHOW"]),
        type: z.enum(["CHECKUP", "VACCINATION", "SURGERY", "EMERGENCY", "GROOMING", "DENTAL", "LABORATORY", "XRAY", "FOLLOWUP", "OTHER"]),
      })),
    }))
    .query(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { id: input.id },
        include: {
          owner: true,
          medicalRecords: {
            orderBy: { visitDate: "desc" },
            take: 10,
          },
          vaccinations: {
            orderBy: { administeredAt: "desc" },
          },
          appointments: {
            orderBy: { scheduledAt: "desc" },
            take: 5,
          },
        },
      })

      if (!patient) {
        throw new Error("Paciente no encontrado")
      }

      return patient
    }),

  // =========================
  // CREATE
  // =========================
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        species: z.nativeEnum(Species),
        breed: z.string().optional(),
        gender: z.nativeEnum(Gender).default(Gender.UNKNOWN),
        color: z.string().optional(),
        birthDate: z.date().optional(),
        weight: z.number().positive().optional(),
        notes: z.string().optional(),
        ownerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      // Validar que el owner exista
      const owner = await ctx.db.owner.findUnique({
        where: { id: input.ownerId },
      })

      if (!owner) {
        throw new Error("Propietario no encontrado")
      }

      return ctx.db.patient.create({
        data: input,
      })
    }),

  // =========================
  // UPDATE
  // =========================
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        species: z.nativeEnum(Species).optional(),
        breed: z.string().optional(),
        gender: z.nativeEnum(Gender).optional(),
        color: z.string().optional(),
        birthDate: z.date().optional(),
        weight: z.number().positive().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
        isDeceased: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isDeceased, ...data } = input

      return ctx.db.patient.update({
        where: { id },
        data: {
          ...data,
          ...(isDeceased === true && {
            isDeceased: true,
            deceasedAt: new Date(),
          }),
          ...(isDeceased === false && {
            isDeceased: false,
            deceasedAt: null,
          }),
        },
      })
    }),

  // =========================
  // DELETE
  // =========================
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.patient.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // =========================
  // GET TIMELINE (historial médico unificado)
  // =========================
  getTimeline: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const [appointments, vaccinations, dewormings, medicalRecords] = await Promise.all([
        ctx.db.appointment.findMany({
          where: { patientId: input.patientId },
          include: { vet: { select: { name: true } } },
          orderBy: { scheduledAt: "desc" },
          take: input.limit,
        }),
        ctx.db.vaccination.findMany({
          where: { patientId: input.patientId },
          orderBy: { administeredAt: "desc" },
          take: input.limit,
        }),
        ctx.db.deworming.findMany({
          where: { patientId: input.patientId },
          orderBy: { administeredAt: "desc" },
          take: input.limit,
        }),
        ctx.db.medicalRecord.findMany({
          where: { patientId: input.patientId },
          include: { vet: { select: { name: true } } },
          orderBy: { visitDate: "desc" },
          take: input.limit,
        }),
      ])

      // Transformar a formato unificado
      const events = [
        ...appointments.map((apt) => ({
          id: apt.id,
          type: "appointment" as const,
          date: apt.scheduledAt,
          title: `Cita: ${apt.type}`,
          description: apt.reason || "",
          status: apt.status,
          vetName: apt.vet.name,
          metadata: apt,
        })),
        ...vaccinations.map((vax) => ({
          id: vax.id,
          type: "vaccination" as const,
          date: vax.administeredAt,
          title: `Vacuna: ${vax.vaccineName}`,
          description: vax.notes || "",
          metadata: vax,
        })),
        ...dewormings.map((dew) => ({
          id: dew.id,
          type: "deworming" as const,
          date: dew.administeredAt,
          title: `Desparasitación: ${dew.productName}`,
          description: dew.productType ? `${dew.productType}${dew.notes ? ` - ${dew.notes}` : ""}` : (dew.notes || ""),
          metadata: dew,
        })),
        ...medicalRecords.map((rec) => ({
          id: rec.id,
          type: "medical_record" as const,
          date: rec.visitDate,
          title: rec.diagnosis || "Consulta médica",
          description: rec.chiefComplaint || "",
          vetName: rec.vet.name,
          metadata: rec,
        })),
      ]

      // Ordenar por fecha descendente
      return events.sort((a, b) => b.date.getTime() - a.date.getTime())
    }),
})