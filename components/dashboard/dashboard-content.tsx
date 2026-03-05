"use client"

import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  PawPrint,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Syringe,
  FileText,
  Loader2,
  Phone,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"

const TYPE_LABELS: Record<string, string> = {
  CHECKUP: "Consulta",
  VACCINATION: "Vacunación",
  SURGERY: "Cirugía",
  EMERGENCY: "Emergencia",
  GROOMING: "Estética",
  DENTAL: "Dental",
  LABORATORY: "Laboratorio",
  XRAY: "Rayos X",
  FOLLOWUP: "Seguimiento",
  OTHER: "Otro",
}

const STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  SCHEDULED: "secondary",
  CONFIRMED: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELED: "destructive",
  NO_SHOW: "destructive",
}

interface DashboardContentProps {
  userName: string
}

export function DashboardContent({ userName }: DashboardContentProps) {
  const { data: stats, isLoading: loadingStats } =
    trpc.dashboard.getStats.useQuery()

  const { data: todayAppointments, isLoading: loadingAppointments } =
    trpc.dashboard.getTodayAppointments.useQuery()

  const { data: recentActivity, isLoading: loadingActivity } =
    trpc.dashboard.getRecentActivity.useQuery()

  const { data: upcomingVaccinations } =
    trpc.dashboard.getUpcomingVaccinations.useQuery()

  if (loadingStats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {userName}
        </h1>
        <p className="text-muted-foreground">
          Resumen general de tu clínica veterinaria.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Pacientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pacientes
            </CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.patients.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Mascotas registradas
            </p>
          </CardContent>
        </Card>

        {/* Propietarios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Propietarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.owners.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        {/* Citas Hoy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Citas Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.appointments.today ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Programadas para hoy
            </p>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {stats?.appointments.pending ?? 0} pendientes
            </div>
          </CardContent>
        </Card>

        {/* Citas Completadas del Mes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Citas Completadas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.appointments.completed ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Citas de Hoy */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Citas de Hoy
                </CardTitle>
                <CardDescription>
                  {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/citas">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loadingAppointments ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !todayAppointments?.length ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay citas programadas para hoy
                </p>
                <Button size="sm" className="mt-4" asChild>
                  <Link href="/citas/nueva">Agendar cita</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <Link
                    key={apt.id}
                    href={`/citas/${apt.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                  >
                    <div>
                      <p className="text-lg font-bold">
                        {format(new Date(apt.scheduledAt), "HH:mm")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apt.patient.name} -{" "}
                        {apt.patient.owner.firstName}{" "}
                        {apt.patient.owner.lastName}
                      </p>
                    </div>

                    <Badge variant={STATUS_COLORS[apt.status] ?? "secondary"}>
                      {TYPE_LABELS[apt.type]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vacunas Próximas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Vacunas Próximas
            </CardTitle>
            <CardDescription>Próximos 30 días</CardDescription>
          </CardHeader>

          <CardContent>
            {!upcomingVaccinations?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay vacunas próximas
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingVaccinations.map((vax) => (
                  <div
                    key={vax.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{vax.vaccineName}</p>
                      <p className="text-sm text-muted-foreground">
                        {vax.patient.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge variant="outline">
                        {format(new Date(vax.nextDueDate!), "d MMM", {
                          locale: es,
                        })}
                      </Badge>
                      <a
                        href={`tel:${vax.patient.owner.phone}`}
                        className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="h-3 w-3" />
                        {vax.patient.owner.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loadingActivity ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !recentActivity?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay actividad reciente
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(
                        new Date(activity.createdAt),
                        {
                          addSuffix: true,
                          locale: es,
                        }
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}