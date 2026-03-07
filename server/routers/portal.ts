import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { TRPCError } from "@trpc/server"

export const portalRouter = createTRPCRouter({

  // 🔐 Validar token
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: { portalToken: input.token },
      })

      if (!owner || !owner.portalEnabled) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token inválido o portal deshabilitado",
        })
      }

      await ctx.db.owner.update({
        where: { id: owner.id },
        data: { lastLoginAt: new Date() },
      })

      return {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        phone: owner.phone,
      }
    }),

  // 🐾 Obtener mascotas del dueño
  getPatients: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: { portalToken: input.token },
      })

      if (!owner || !owner.portalEnabled) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      return ctx.db.patient.findMany({
        where: {
          ownerId: owner.id,
          isActive: true,
        },
        orderBy: { name: "asc" },
      })
    }),

  // 📅 Obtener citas
  getAppointments: publicProcedure
    .input(
      z.object({
        token: z.string(),
        upcoming: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: { portalToken: input.token },
        include: { patients: { select: { id: true } } },
      })

      if (!owner || !owner.portalEnabled) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const patientIds = owner.patients.map((p) => p.id)

      return ctx.db.appointment.findMany({
        where: {
          patientId: { in: patientIds },
          ...(input.upcoming && {
            scheduledAt: { gte: new Date() },
            status: { in: ["SCHEDULED", "CONFIRMED"] },
          }),
        },
        include: {
          patient: { select: { name: true, species: true } },
          vet: { select: { name: true } },
        },
        orderBy: {
          scheduledAt: input.upcoming ? "asc" : "desc",
        },
      })
    }),

  // 💉 Vacunas
  getVaccinations: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: { portalToken: input.token },
        include: { patients: { select: { id: true } } },
      })

      if (!owner || !owner.portalEnabled) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const patientIds = owner.patients.map((p) => p.id)

      return ctx.db.vaccination.findMany({
        where: {
          patientId: { in: patientIds },
        },
        include: {
          patient: { select: { name: true } },
        },
        orderBy: { administeredAt: "desc" },
      })
    }),

  // 🏥 Historial médico (limitado)
  getMedicalRecords: publicProcedure
    .input(
      z.object({
        token: z.string(),
        patientId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const owner = await ctx.db.owner.findUnique({
        where: { portalToken: input.token },
        include: { patients: { select: { id: true } } },
      })

      if (!owner || !owner.portalEnabled) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      if (!owner.patients.some((p) => p.id === input.patientId)) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      return ctx.db.medicalRecord.findMany({
        where: {
          patientId: input.patientId,
        },
        select: {
          id: true,
          visitDate: true,
          diagnosis: true,
          treatment: true,
          internalNotes: true,
          vet: { select: { name: true } },
        },
        orderBy: { visitDate: "desc" },
      })
    }),
})