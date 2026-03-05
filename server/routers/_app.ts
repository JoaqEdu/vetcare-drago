import { createTRPCRouter } from "../trpc"
import { appointmentsRouter } from "./appointments"
import { dashboardRouter } from "./dashboard"
import { medicalRecordsRouter } from "./medicalRecords"
import { notificationsRouter } from "./notifications"
import { ownersRouter } from "./owners"
import { patientsRouter } from "./patients"
import { portalRouter } from "./portal"
import { vaccinationsRouter } from "./vaccinations"

export const appRouter = createTRPCRouter({
    patients: patientsRouter,
    owners: ownersRouter,
    appointments: appointmentsRouter,
    medicalRecords: medicalRecordsRouter,
    vaccinations: vaccinationsRouter,
    dashboard: dashboardRouter,
    portal: portalRouter,
    notifications: notificationsRouter
})

export type AppRouter = typeof appRouter
