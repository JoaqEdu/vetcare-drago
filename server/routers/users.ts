import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"

export const usersRouter = createTRPCRouter({
  // =========================
  // GET CURRENT USER
  // =========================
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuario no encontrado",
      })
    }

    return user
  }),

  // =========================
  // CHANGE OWN PASSWORD
  // =========================
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "La contraseña actual es requerida"),
        newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Obtener usuario actual con contraseña
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, password: true },
      })

      if (!user || !user.password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        })
      }

      // Verificar contraseña actual
      const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password)

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La contraseña actual es incorrecta",
        })
      }

      // Verificar que la nueva contraseña sea diferente
      const isSamePassword = await bcrypt.compare(input.newPassword, user.password)

      if (isSamePassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La nueva contraseña debe ser diferente a la actual",
        })
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(input.newPassword, 10)

      // Actualizar contraseña
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedPassword },
      })

      return { success: true }
    }),

  // =========================
  // RESET PASSWORD (ADMIN ONLY)
  // =========================
  resetPassword: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Solo admins pueden resetear contraseñas
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para resetear contraseñas",
        })
      }

      // Verificar que el usuario existe
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { id: true, name: true },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        })
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(input.newPassword, 10)

      // Actualizar contraseña
      await ctx.db.user.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
      })

      return { success: true, userName: user.name }
    }),

  // =========================
  // LIST ALL USERS (ADMIN ONLY)
  // =========================
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permisos para ver usuarios",
      })
    }

    return ctx.db.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }),

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
