import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { Species, Gender } from "@prisma/client"

export const patientsRouter = createTRPCRouter({

  // =========================
  // LIST
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
              { name: { contains: search, mode: "insensitive" } },
              { owner: { firstName: { contains: search, mode: "insensitive" } } },
              { owner: { lastName: { contains: search, mode: "insensitive" } } },
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
  // GET BY ID
  // =========================
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
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
})