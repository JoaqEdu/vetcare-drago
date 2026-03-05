import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { type Session } from "next-auth"
import { db } from "@/lib/db"

interface CreateContextOptions {
  session: Session | null
}

export const createTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  }
}

export type Context = ReturnType<typeof createTRPCContext>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// 🔐 Solo usuarios autenticados
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)