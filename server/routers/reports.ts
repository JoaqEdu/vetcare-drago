import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from "date-fns"

export const reportsRouter = createTRPCRouter({

  getMonthlySummary: protectedProcedure
    .input(z.object({
      year: z.number(),
      month: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1)
      const endDate = endOfMonth(startDate)
      
      const prevMonthStart = subMonths(startDate, 1)
      const prevMonthEnd = endOfMonth(prevMonthStart)

      const [
        totalAppointments,
        completedAppointments,
        newPatients,
        newOwners,
        prevTotalAppointments,
        prevNewPatients,
      ] = await Promise.all([
        ctx.db.appointment.count({
          where: {
            scheduledAt: { gte: startDate, lte: endDate },
          },
        }),
        ctx.db.appointment.count({
          where: {
            scheduledAt: { gte: startDate, lte: endDate },
            status: "COMPLETED",
          },
        }),
        ctx.db.patient.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        ctx.db.owner.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        ctx.db.appointment.count({
          where: {
            scheduledAt: { gte: prevMonthStart, lte: prevMonthEnd },
          },
        }),
        ctx.db.patient.count({
          where: {
            createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
          },
        }),
      ])

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
      }

      return {
        appointments: {
          current: totalAppointments,
          change: calculateChange(totalAppointments, prevTotalAppointments),
        },
        completedAppointments: {
          current: completedAppointments,
          change: calculateChange(completedAppointments, prevTotalAppointments),
        },
        newPatients: {
          current: newPatients,
          change: calculateChange(newPatients, prevNewPatients),
        },
        newOwners,
      }
    }),

  getAppointmentsReport: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const appointments = await ctx.db.appointment.findMany({
        where: {
          scheduledAt: { gte: input.startDate, lte: input.endDate },
        },
        include: {
          patient: {
            include: { owner: true },
          },
          vet: true,
        },
      })

      const byStatus = {
        SCHEDULED: 0,
        CONFIRMED: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELED: 0,
        NO_SHOW: 0,
      }

      const byType: Record<string, number> = {}
      const byDayOfWeek: Record<string, number> = {
        "Domingo": 0,
        "Lunes": 0,
        "Martes": 0,
        "Miércoles": 0,
        "Jueves": 0,
        "Viernes": 0,
        "Sábado": 0,
      }

      const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

      appointments.forEach((apt) => {
        byStatus[apt.status] = (byStatus[apt.status] || 0) + 1
        byType[apt.type] = (byType[apt.type] || 0) + 1
        const dayIndex = apt.scheduledAt.getDay()
        byDayOfWeek[days[dayIndex]] = (byDayOfWeek[days[dayIndex]] || 0) + 1
      })

      const total = appointments.length
      const completed = byStatus.COMPLETED
      const canceled = byStatus.CANCELED
      const completionRate = total > 0 ? (completed / total) * 100 : 0
      const cancellationRate = total > 0 ? (canceled / total) * 100 : 0

      return { 
        byStatus, 
        byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
        byDayOfWeek: Object.entries(byDayOfWeek).map(([day, count]) => ({ day, count })),
        total,
        completionRate,
        cancellationRate,
      }
    }),

  getPatientsReport: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const [totalActive, patientsInPeriod, appointmentsInPeriod] = await Promise.all([
        ctx.db.patient.count({
          where: { isActive: true },
        }),
        ctx.db.patient.findMany({
          where: {
            createdAt: { gte: input.startDate, lte: input.endDate },
          },
          include: {
            owner: true,
          },
        }),
        ctx.db.appointment.findMany({
          where: {
            scheduledAt: { gte: input.startDate, lte: input.endDate },
            status: "COMPLETED",
          },
          select: { patientId: true },
        }),
      ])

      const bySpecies: Record<string, number> = {}

      patientsInPeriod.forEach((p) => {
        bySpecies[p.species] = (bySpecies[p.species] || 0) + 1
      })

      const uniquePatientsInPeriod = new Set(appointmentsInPeriod.map(a => a.patientId)).size

      return { 
        bySpecies: Object.entries(bySpecies).map(([species, count]) => ({ species, count })), 
        total: totalActive,
        totalActive,
        newPatients: patientsInPeriod.length,
        attendedInPeriod: uniquePatientsInPeriod,
      }
    }),

  getTopServicesReport: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
      limit: z.number().default(5),
    }))
    .query(async ({ ctx, input }) => {
      const appointments = await ctx.db.appointment.findMany({
        where: {
          scheduledAt: { gte: input.startDate, lte: input.endDate },
          status: "COMPLETED",
        },
      })

      const serviceCount: Record<string, number> = {}

      appointments.forEach((apt) => {
        serviceCount[apt.type] = (serviceCount[apt.type] || 0) + 1
      })

      return Object.entries(serviceCount)
        .map(([service, count]) => ({
          description: service,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, input.limit)
    }),

  getVetPerformanceReport: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const appointments = await ctx.db.appointment.findMany({
        where: {
          scheduledAt: { gte: input.startDate, lte: input.endDate },
          status: "COMPLETED",
        },
        include: {
          vet: true,
        },
      })

      const vetStats: Record<string, { total: number; completed: number }> = {}

      appointments.forEach((apt) => {
        if (!vetStats[apt.vetId]) {
          vetStats[apt.vetId] = { total: 0, completed: 0 }
        }
        vetStats[apt.vetId].total++
        if (apt.status === "COMPLETED") {
          vetStats[apt.vetId].completed++
        }
      })

      const vets = await ctx.db.user.findMany({
        where: { role: { in: ["VET", "ADMIN"] } },
      })

      return vets.map((vet) => ({
        vetId: vet.id,
        vetName: vet.name,
        total: vetStats[vet.id]?.total || 0,
        completed: vetStats[vet.id]?.completed || 0,
        canceled: 0,
        completionRate: vetStats[vet.id]?.total ? (vetStats[vet.id].completed / vetStats[vet.id].total) * 100 : 0,
      }))
    }),
})
