import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { addDays } from "date-fns"
import { Prisma } from "@prisma/client"

export const notificationsRouter = createTRPCRouter({

  getUpcomingReminders: protectedProcedure.query(async ({ ctx }) => {
    const tomorrow = addDays(new Date(), 1)
    const endOfWeek = addDays(new Date(), 7)

    const appointments = await ctx.db.appointment.findMany({
      where: {
        scheduledAt: {
          gte: tomorrow,
          lte: endOfWeek,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
        notifications: {
          none: {
            type: "APPOINTMENT_REMINDER",
          },
        },
      },
      include: {
        patient: {
          include: {
            owner: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    })

    return appointments
  }),

  getVaccinationsDue: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date()
    const in30Days = addDays(today, 30)

    const vaccinations = await ctx.db.vaccination.findMany({
      where: {
        nextDueDate: {
          gte: today,
          lte: in30Days,
        },
      },
      include: {
        patient: {
          include: {
            owner: true,
          },
        },
      },
      orderBy: {
        nextDueDate: "asc",
      },
    })

    return vaccinations
  }),

  sendAppointmentReminders: protectedProcedure.mutation(async ({ ctx }) => {
    const tomorrow = addDays(new Date(), 1)
    const endOfWeek = addDays(new Date(), 7)

    const appointments = await ctx.db.appointment.findMany({
      where: {
        scheduledAt: {
          gte: tomorrow,
          lte: endOfWeek,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
      include: {
        patient: {
          include: {
            owner: true,
          },
        },
      },
    })

    let sent = 0

    for (const appointment of appointments) {
      if (appointment.patient.owner && appointment.patient.owner.phone) {
        await ctx.db.notification.create({
          data: {
            title: "Recordatorio de Cita",
            message: `Su mascota ${appointment.patient.name} tiene una cita programada para el ${appointment.scheduledAt.toLocaleDateString("es-ES")} a las ${appointment.scheduledAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
            type: "APPOINTMENT_REMINDER",
            channel: "IN_APP",
            status: "SENT",
            sentAt: new Date(),
            ownerId: appointment.patient.owner.id,
            patientId: appointment.patient.id,
            appointmentId: appointment.id,
          },
        })
        sent++
      }
    }

    return { sent }
  }),

  sendVaccinationReminders: protectedProcedure.mutation(async ({ ctx }) => {
    const today = new Date()
    const in30Days = addDays(today, 30)

    const vaccinations = await ctx.db.vaccination.findMany({
      where: {
        nextDueDate: {
          gte: today,
          lte: in30Days,
        },
      },
      include: {
        patient: {
          include: {
            owner: true,
          },
        },
      },
    })

    let sent = 0

    for (const vaccination of vaccinations) {
      if (vaccination.patient.owner && vaccination.patient.owner.phone) {
        await ctx.db.notification.create({
          data: {
            title: "Vacuna Próxima",
            message: `La vacuna ${vaccination.vaccineName} de ${vaccination.patient.name} vence el ${vaccination.nextDueDate?.toLocaleDateString("es-ES")}`,
            type: "VACCINATION_DUE",
            channel: "IN_APP",
            status: "SENT",
            sentAt: new Date(),
            ownerId: vaccination.patient.owner.id,
            patientId: vaccination.patient.id,
          },
        })
        sent++
      }
    }

    return { sent }
  }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.delete({
        where: {
          id: input.id,
        },
      })
      return { success: true }
    }),

  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .output(z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(["APPOINTMENT_REMINDER", "VACCINATION_DUE", "GENERAL"]),
      message: z.string(),
      channel: z.enum(["IN_APP", "EMAIL"]),
      status: z.enum(["PENDING", "SENT", "READ", "FAILED"]),
      ownerId: z.string().nullable(),
      userId: z.string().nullable(),
      appointmentId: z.string().nullable(),
      patientId: z.string().nullable(),
      scheduledFor: z.date().nullable(),
      sentAt: z.date().nullable(),
      readAt: z.date().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })))
    .query(async ({ ctx, input }) => {
      return ctx.db.notification.findMany({
        where: {
          OR: [
            { userId: ctx.session.user.id },
            { ownerId: ctx.session.user.id },
          ],
          channel: "IN_APP",
          ...(input.unreadOnly ? { readAt: null } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
      })
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.count({
      where: {
        userId: ctx.session.user.id,
        channel: "IN_APP",
        readAt: null,
      },
    })
  }),

  markAsRead: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.update({
        where: {
          id: input.id,
        },
        data: {
          readAt: new Date(),
          status: "READ",
        },
      })

      return { success: true }
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: "READ",
      },
    })

    return { success: true }
  }),

})