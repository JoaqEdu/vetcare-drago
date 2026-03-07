import { createTRPCRouter } from "../trpc"
import { appointmentsRouter } from "./appointments"
import { dashboardRouter } from "./dashboard"
import { medicalRecordsRouter } from "./medicalRecords"
import { notificationsRouter } from "./notifications"
import { ownersRouter } from "./owners"
import { patientsRouter } from "./patients"
import { portalRouter } from "./portal"
import { vaccinationsRouter } from "./vaccinations"
import { dewormingsRouter } from "./dewormings"
import { dentalRouter } from "./dental"
import { laboratoryRouter } from "./laboratory"
import { xrayRouter } from "./xray"
import { reportsRouter } from "./reports"
import { searchRouter } from "./search"
import { pdfRouter } from "./pdf"
import { usersRouter } from "./users"

export const appRouter = createTRPCRouter({
    patients: patientsRouter,
    owners: ownersRouter,
    appointments: appointmentsRouter,
    medicalRecords: medicalRecordsRouter,
    vaccinations: vaccinationsRouter,
    dewormings: dewormingsRouter,
    dental: dentalRouter,
    laboratory: laboratoryRouter,
    xray: xrayRouter,
    dashboard: dashboardRouter,
    portal: portalRouter,
    notifications: notificationsRouter,
    reports: reportsRouter,
    search: searchRouter,
    pdf: pdfRouter,
    users: usersRouter,
})

export type AppRouter = typeof appRouter
