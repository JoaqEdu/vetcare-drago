import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"

export const usersRouter = createTRPCRouter({
  // =========================
  // CREATE
  // =========================
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(["ADMIN", "VET", "RECEPTIONIST"]),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Solo admins pueden crear usuarios
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para crear usuarios",
        })
      }

      // Verificar si el email ya existe
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe un usuario con este email",
        })
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(input.password, 10)

      return ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          phone: input.phone,
        },
      })
    }),

  // =========================
  // DELETE (SOFT DELETE)
  // =========================
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Solo admins pueden eliminar usuarios
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para eliminar usuarios",
        })
      }

      // No permitir que el usuario se elimine a sí mismo
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No puedes eliminarte a ti mismo",
        })
      }

      await ctx.db.user.update({
        where: { id: input.id },
        data: { isActive: false },
      })

      return { success: true }
    }),
})
