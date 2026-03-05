import { createTRPCRouter, protectedProcedure } from "../trpc"

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date()

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const [
      totalPatients,
      patientsLastMonth,
      totalOwners,
      ownersLastMonth,
      todayAppointments,
      pendingAppointments,
      upcomingVaccinations,
      completedThisMonth,
    ] = await Promise.all([

      // Total patients activos
      ctx.db.patient.count({
        where: { isActive: true },
      }),

      // Pacientes creados el mes pasado
      ctx.db.patient.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Total owners
      ctx.db.owner.count(),

      // Owners creados el mes pasado
      ctx.db.owner.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Citas hoy
      ctx.db.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),

      // Citas pendientes hoy
      ctx.db.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: { in: ["SCHEDULED", "CONFIRMED"] },
        },
      }),

      // Vacunas próximas (30 días)
      ctx.db.vaccination.count({
        where: {
          nextDueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Citas completadas este mes
      ctx.db.appointment.count({
        where: {
          status: "COMPLETED",
          scheduledAt: {
            gte: startOfMonth,
            lte: now,
          },
        },
      }),
    ])

    return {
      patients: {
        total: totalPatients,
        lastMonth: patientsLastMonth,
      },
      owners: {
        total: totalOwners,
        lastMonth: ownersLastMonth,
      },
      appointments: {
        today: todayAppointments,
        pending: pendingAppointments,
        completed: completedThisMonth
      },
      vaccinations: {
        upcoming: upcomingVaccinations,
      },
    }
  }),

  getTodayAppointments: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    return ctx.db.appointment.findMany({
      where: {
        scheduledAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
            owner: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
        vet: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    })
  }),

  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    const [recentAppointments, recentMedicalRecords, recentPatients] =
      await Promise.all([
        // Últimas citas creadas
        ctx.db.appointment.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            patient: {
              select: {
                name: true,
                owner: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
            vet: {
              select: { name: true },
            },
          },
        }),

        // Últimos registros médicos
        ctx.db.medicalRecord.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            patient: {
              select: { name: true },
            },
            vet: {
              select: { name: true },
            },
          },
        }),

        // Últimos pacientes registrados
        ctx.db.patient.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            owner: {
              select: { firstName: true, lastName: true },
            },
          },
        }),
      ])

    // Normalizamos todo en un solo array
    const activity = [
      ...recentAppointments.map((a) => ({
        id: a.id,
        type: "APPOINTMENT",
        title: `Nueva cita para ${a.patient.name}`,
        description: `Vet: ${a.vet.name} • Propietario: ${a.patient.owner.firstName} ${a.patient.owner.lastName}`,
        createdAt: a.createdAt,
      })),

      ...recentMedicalRecords.map((r) => ({
        id: r.id,
        type: "MEDICAL_RECORD",
        title: `Historia clínica actualizada`,
        description: `Paciente: ${r.patient.name} • Vet: ${r.vet.name}`,
        createdAt: r.createdAt,
      })),

      ...recentPatients.map((p) => ({
        id: p.id,
        type: "PATIENT",
        title: `Nuevo paciente registrado`,
        description: `${p.name} • Propietario: ${p.owner.firstName} ${p.owner.lastName}`,
        createdAt: p.createdAt,
      })),
    ]

    // Ordenamos todo por fecha
    return activity
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
  }),

  getUpcomingVaccinations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.vaccination.findMany({
      where: {
        nextDueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            owner: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
      orderBy: { nextDueDate: "asc" },
      take: 5,
    })
  }),
})