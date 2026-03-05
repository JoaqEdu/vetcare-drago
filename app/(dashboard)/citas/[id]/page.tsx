import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Clock,
  User,
  PawPrint,
  Phone,
  Mail,
  Stethoscope,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const TYPE_LABELS: Record<string, string> = {
  CHECKUP: "Consulta",
  VACCINATION: "Vacunacion",
  SURGERY: "Cirugia",
  EMERGENCY: "Emergencia",
  GROOMING: "Estetica",
  DENTAL: "Dental",
  LABORATORY: "Laboratorio",
  XRAY: "Rayos X",
  FOLLOWUP: "Seguimiento",
  OTHER: "Otro",
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELED: "Cancelada",
  NO_SHOW: "No asistio",
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  SCHEDULED: "secondary",
  CONFIRMED: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELED: "destructive",
  NO_SHOW: "outline",
}

const SPECIES_LABELS: Record<string, string> = {
  DOG: "Perro",
  CAT: "Gato",
  BIRD: "Ave",
  RABBIT: "Conejo",
  HAMSTER: "Hamster",
  FISH: "Pez",
  REPTILE: "Reptil",
  OTHER: "Otro",
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect("/login")
  }

  const appointment = await db.appointment.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      patient: {
        include: {
          owner: true,
        },
      },
      vet: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      medicalRecord: true,
    },
  })

  if (!appointment) {
    notFound()
  }

  const scheduledAt = new Date(appointment.scheduledAt)
  const endTime = new Date(scheduledAt.getTime() + appointment.duration * 60000)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/citas"
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Cita - {appointment.patient.name}
              </h1>
              <Badge variant={STATUS_COLORS[appointment.status]}>
                {STATUS_LABELS[appointment.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {format(scheduledAt, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/citas/${appointment.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Detalles de la Cita */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalles de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(scheduledAt, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horario</p>
                  <p className="font-medium">
                    {format(scheduledAt, "HH:mm")} - {format(endTime, "HH:mm")}
                    <span className="ml-1 text-sm text-muted-foreground">
                      ({appointment.duration} min)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Stethoscope className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{TYPE_LABELS[appointment.type]}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Veterinario</p>
                  <p className="font-medium">{appointment.vet.name}</p>
                </div>
              </div>
            </div>

            {appointment.reason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Motivo de la Consulta
                  </p>
                  <p className="whitespace-pre-wrap">{appointment.reason}</p>
                </div>
              </>
            )}

            {appointment.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Notas
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{appointment.notes}</p>
                </div>
              </>
            )}

            {/* Status History */}
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Estado de la Cita
              </p>
              <div className="flex items-center gap-4">
                {appointment.status === "COMPLETED" ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Cita completada</span>
                  </div>
                ) : appointment.status === "CANCELED" ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span>Cita cancelada</span>
                  </div>
                ) : appointment.status === "NO_SHOW" ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-5 w-5" />
                    <span>Paciente no asistio</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_COLORS[appointment.status]}>
                      {STATUS_LABELS[appointment.status]}
                    </Badge>
                    {appointment.confirmedAt && (
                      <span className="text-sm text-muted-foreground">
                        Confirmada el {format(new Date(appointment.confirmedAt), "d MMM, HH:mm", { locale: es })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paciente y Propietario */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/pacientes/${appointment.patient.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <PawPrint className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{appointment.patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {SPECIES_LABELS[appointment.patient.species]}
                      {appointment.patient.breed && ` - ${appointment.patient.breed}`}
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Propietario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/propietarios/${appointment.patient.owner.id}`}
                className="font-medium hover:underline"
              >
                {appointment.patient.owner.firstName} {appointment.patient.owner.lastName}
              </Link>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${appointment.patient.owner.phone}`} className="hover:underline">
                    {appointment.patient.owner.phone}
                  </a>
                </div>
                {appointment.patient.owner.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${appointment.patient.owner.email}`} className="hover:underline">
                      {appointment.patient.owner.email}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medical Record Link */}
          {appointment.medicalRecord ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Expediente Medico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/pacientes/${appointment.patient.id}?tab=historial`}>
                    Ver Expediente
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : appointment.status === "COMPLETED" || appointment.status === "IN_PROGRESS" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Expediente Medico
                </CardTitle>
                <CardDescription>
                  No se ha creado un expediente para esta cita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/pacientes/${appointment.patient.id}/expediente/nuevo?appointmentId=${appointment.id}`}>
                    Crear Expediente
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
