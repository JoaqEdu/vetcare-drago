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
  DEWORMING: "Desparasitacion",
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

  if (!session) {
    redirect("/login")
  }

  const appointment = await db.appointment.findFirst({
    where: {
      id,
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

  // Verificar si ya existe un registro vinculado a esta cita específica
  let existingVaccination = null
  let existingDeworming = null
  let existingDental = null
  let existingLab = null
  let existingXRay = null

  if (appointment.type === "VACCINATION") {
    existingVaccination = await db.vaccination.findUnique({
      where: { appointmentId: id },
    })
  } else if (appointment.type === "DEWORMING") {
    existingDeworming = await db.deworming.findUnique({
      where: { appointmentId: id },
    })
  } else if (appointment.type === "DENTAL") {
    existingDental = await db.dentalRecord.findUnique({
      where: { appointmentId: id },
    })
  } else if (appointment.type === "LABORATORY") {
    existingLab = await db.labResult.findUnique({
      where: { appointmentId: id },
    })
  } else if (appointment.type === "XRAY") {
    existingXRay = await db.xRayRecord.findUnique({
      where: { appointmentId: id },
    })
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
                  <p className="font-medium">
                    {TYPE_LABELS[appointment.type]}
                    {appointment.type === "VACCINATION" && appointment.vaccineName && (
                      <span className="text-muted-foreground"> - {appointment.vaccineName}</span>
                    )}
                  </p>
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

            {/* Vaccine Details - Solo para citas de vacunación */}
            {appointment.type === "VACCINATION" && appointment.vaccineName && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Detalles de la Vacuna
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Vacuna:</span>
                      <span className="font-medium">{appointment.vaccineName}</span>
                    </div>
                    {appointment.vaccineType && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span className="font-medium">{appointment.vaccineType}</span>
                      </div>
                    )}
                    {appointment.vaccineManufacturer && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Laboratorio:</span>
                        <span className="font-medium">{appointment.vaccineManufacturer}</span>
                      </div>
                    )}
                  </div>
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

          {/* Acción Post-Cita - Enrutamiento Inteligente por Tipo */}
          {(appointment.status === "COMPLETED" || appointment.status === "IN_PROGRESS") && (
            <>
              {/* VACCINATION → Formulario de Vacuna */}
              {appointment.type === "VACCINATION" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${existingVaccination ? "text-green-600" : ""}`} />
                      Registro de Vacunación
                    </CardTitle>
                    <CardDescription>
                      {existingVaccination
                        ? "La vacuna ya ha sido registrada"
                        : "Completar información de la vacuna aplicada"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {existingVaccination ? (
                      <>
                        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm">
                          <p className="font-medium text-green-900 dark:text-green-100">
                            ✓ Vacuna registrada: {existingVaccination.vaccineName}
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                            {format(new Date(existingVaccination.administeredAt), "PPP", { locale: es })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No se pueden registrar duplicados para la misma cita
                        </p>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/pacientes/${appointment.patient.id}/vacunas/nueva?appointmentId=${appointment.id}`}>
                          Registrar Vacuna
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* DEWORMING → Formulario de Desparasitación */}
              {appointment.type === "DEWORMING" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${existingDeworming ? "text-green-600" : ""}`} />
                      Registro de Desparasitación
                    </CardTitle>
                    <CardDescription>
                      {existingDeworming
                        ? "La desparasitación ya ha sido registrada"
                        : "Completar información del desparasitante aplicado"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {existingDeworming ? (
                      <>
                        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm">
                          <p className="font-medium text-green-900 dark:text-green-100">
                            ✓ Desparasitación registrada: {existingDeworming.productName}
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                            {format(new Date(existingDeworming.administeredAt), "PPP", { locale: es })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No se pueden registrar duplicados para la misma cita
                        </p>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/pacientes/${appointment.patient.id}/desparasitaciones/nueva?appointmentId=${appointment.id}`}>
                          Registrar Desparasitación
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* DENTAL → Formulario Dental */}
              {appointment.type === "DENTAL" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${existingDental ? "text-green-600" : ""}`} />
                      Registro Dental
                    </CardTitle>
                    <CardDescription>
                      {existingDental
                        ? "El procedimiento dental ya ha sido registrado"
                        : "Completar información del procedimiento dental"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {existingDental ? (
                      <>
                        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm">
                          <p className="font-medium text-green-900 dark:text-green-100">
                            ✓ Procedimiento registrado: {existingDental.procedure}
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                            {format(new Date(existingDental.performedAt), "PPP", { locale: es })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No se pueden registrar duplicados para la misma cita
                        </p>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/pacientes/${appointment.patient.id}/dental/nuevo?appointmentId=${appointment.id}`}>
                          Registrar Procedimiento Dental
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* LABORATORY → Formulario de Laboratorio */}
              {appointment.type === "LABORATORY" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${existingLab ? "text-green-600" : ""}`} />
                      Resultados de Laboratorio
                    </CardTitle>
                    <CardDescription>
                      {existingLab
                        ? "Los resultados de laboratorio ya han sido registrados"
                        : "Registrar resultados de análisis de laboratorio"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {existingLab ? (
                      <>
                        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm">
                          <p className="font-medium text-green-900 dark:text-green-100">
                            ✓ Resultados registrados: {existingLab.testType}
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                            {format(new Date(existingLab.sampleDate), "PPP", { locale: es })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No se pueden registrar duplicados para la misma cita
                        </p>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/pacientes/${appointment.patient.id}/laboratorio/nuevo?appointmentId=${appointment.id}`}>
                          Registrar Resultados
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* XRAY → Formulario de Rayos X */}
              {appointment.type === "XRAY" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${existingXRay ? "text-green-600" : ""}`} />
                      Informe de Rayos X
                    </CardTitle>
                    <CardDescription>
                      {existingXRay
                        ? "El estudio de rayos X ya ha sido registrado"
                        : "Registrar hallazgos radiográficos"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {existingXRay ? (
                      <>
                        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm">
                          <p className="font-medium text-green-900 dark:text-green-100">
                            ✓ Rayos X registrado: {existingXRay.bodyPart}
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                            {format(new Date(existingXRay.performedAt), "PPP", { locale: es })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No se pueden registrar duplicados para la misma cita
                        </p>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/pacientes/${appointment.patient.id}/rayos-x/nuevo?appointmentId=${appointment.id}`}>
                          Registrar Rayos X
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* CHECKUP, SURGERY, EMERGENCY, FOLLOWUP, etc. → Expediente Médico */}
              {!["VACCINATION", "DEWORMING", "GROOMING", "DENTAL", "LABORATORY", "XRAY"].includes(appointment.type) && (
                <>
                  {appointment.medicalRecord ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Expediente Médico
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/pacientes/${appointment.patient.id}/expediente/${appointment.medicalRecord.id}`}>
                            Ver Expediente
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Expediente Médico
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
                  )}
                </>
              )}

              {/* GROOMING → Sin formulario específico, solo completar cita */}
              {appointment.type === "GROOMING" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Cita de Estética
                    </CardTitle>
                    <CardDescription>
                      Este tipo de cita no requiere expediente médico
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      La cita se ha completado. No es necesario crear documentación adicional.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
