import { z } from "zod"
import { Prisma } from "@prisma/client"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import crypto from "crypto"

export const ownersRouter = createTRPCRouter({

  // =========================
  // LIST
  // =========================
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, limit, cursor } = input

      const owners = await ctx.db.owner.findMany({
        where: {
          isActive: true,
          ...(search && {
            OR: [
              { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }),
        },
        include: {
          patients: {
            select: {
              id: true,
              name: true,
              species: true,
            },
          },
          _count: {
            select: { patients: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined = undefined

      if (owners.length > limit) {
        const nextItem = owners.pop()
        nextCursor = nextItem!.id
      }

      return {
        owners,
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
        isActive: z.boolean().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, isActive, page, pageSize } = input
      const skip = (page - 1) * pageSize

      const where = {
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: search } },
          ],
        }),
      }

      const [owners, total] = await Promise.all([
        ctx.db.owner.findMany({
          where,
          include: {
            _count: {
              select: {
                patients: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        ctx.db.owner.count({ where }),
      ])

      return {
        owners,
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
      return ctx.db.owner.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          patients: {
            include: {
              _count: {
                select: {
                  appointments: true,
                  medicalRecords: true,
                },
              },
            },
          },
        },
      })
    }),

  // =========================
  // CREATE
  // =========================
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(1),
        address: z.string().optional(),
        patients: z
          .array(
            z.object({
              name: z.string().min(1),
              species: z.enum(["DOG", "CAT", "BIRD", "RABBIT", "OTHER"]),
              breed: z.string().optional(),
              gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
              birthDate: z.date().optional(),
              weight: z.number().optional(),
              color: z.string().optional(),
              chipNumber: z.string().optional(),
              notes: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { patients, ...ownerData } = input

      return ctx.db.owner.create({
        data: {
          ...ownerData,
          email: ownerData.email ?? null,
          ...(patients &&
            patients.length > 0 && {
              patients: {
                create: patients,
              },
            }),
        },
        include: {
          patients: true,
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
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(1).optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      return ctx.db.owner.update({
        where: { id },
        data: {
          ...data,
          email: data.email ?? undefined,
        },
      })
    }),

  // =========================
  // SOFT DELETE
  // =========================
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.owner.update({
        where: { id: input.id },
        data: { isActive: false },
      })

      return { success: true }
    }),

  // =========================
  // GET PORTAL INFO
  // =========================
  getPortalInfo: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {

      const owner = await ctx.db.owner.findUnique({
        where: { id: input.id },
        select: {
          portalEnabled: true,
          portalToken: true,
          lastLoginAt: true,
        },
      })

      return owner
    }),

    // =========================
// GENERATE PORTAL TOKEN
// =========================
  generatePortalToken: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {

      const token = crypto.randomBytes(32).toString("hex")

      await ctx.db.owner.update({
        where: { id: input.id },
        data: {
          portalToken: token,
          portalEnabled: true,
        },
      })

      return { success: true }
    }),
  // =========================
  // TOGGLE PORTAL
  // =========================
  togglePortalAccess: protectedProcedure
    .input(z.object({ id: z.string(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {

      let data: any = {
        portalEnabled: input.enabled,
      }

      if (input.enabled) {
        const token = crypto.randomBytes(32).toString("hex")
        data.portalToken = token
      }

      if (!input.enabled) {
        data.portalToken = null
      }

      await ctx.db.owner.update({
        where: { id: input.id },
        data,
      })

      return { success: true }
    }),
})