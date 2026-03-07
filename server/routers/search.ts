import { z } from "zod"
import { Prisma } from "@prisma/client"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const searchRouter = createTRPCRouter({
  global: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const searchTerm = input.query.toLowerCase()

      const [patients, owners, appointments] = await Promise.all([
        // Buscar pacientes por nombre o chip
        ctx.db.patient.findMany({
          where: {
            OR: [
              { name: { contains: input.query, mode: Prisma.QueryMode.insensitive } },
              { chipNumber: { contains: input.query, mode: Prisma.QueryMode.insensitive } },
            ],
            isActive: true,
          },
          include: { owner: { select: { firstName: true, lastName: true } } },
          take: input.limit,
          orderBy: { name: "asc" },
        }),

        // Buscar propietarios por nombre, email o teléfono
        ctx.db.owner.findMany({
          where: {
            OR: [
              { firstName: { contains: input.query, mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: input.query, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: input.query, mode: Prisma.QueryMode.insensitive } },
              { phone: { contains: input.query } },
            ],
            isActive: true,
          },
          include: {
            _count: {
              select: { patients: true },
            },
          },
          take: input.limit,
          orderBy: { firstName: "asc" },
        }),

        // Buscar citas por nombre de paciente
        ctx.db.appointment.findMany({
          where: {
            patient: {
              name: { contains: input.query, mode: Prisma.QueryMode.insensitive },
            },
          },
          include: {
            patient: { select: { name: true } },
            vet: { select: { name: true } },
          },
          take: input.limit,
          orderBy: { scheduledAt: "desc" },
        }),
      ])

      return {
        patients,
        owners,
        appointments,
      }
    }),
})
