import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const notificationsRouter = createTRPCRouter({

  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.notification.findMany({
        where: {
          userId: ctx.session.user.id,
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