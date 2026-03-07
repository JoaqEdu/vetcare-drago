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
  Phone,
  Mail,
  MapPin,
  PawPrint,
  Syringe,
  FileText,
  Clock,
  Bug,
  Smile,
  FlaskConical,
  Scan,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PatientTimeline } from "@/components/timeline/patient-timeline"

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

const GENDER_LABELS: Record<string, string> = {
  MALE: "Macho",
  FEMALE: "Hembra",
  UNKNOWN: "Desconocido",
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const patient = await db.patient.findFirst({
    where: {
      id,
    },
    include: {
      owner: true,
      vaccinations: {
        orderBy: { administeredAt: "desc" },
        take: 5,
      },
      dewormings: {
        orderBy: { administeredAt: "desc" },
        take: 5,
      },
      dentalRecords: {
        orderBy: { performedAt: "desc" },
        take: 5,
      },
      labResults: {
        orderBy: { sampleDate: "desc" },
        take: 5,
      },
      xrayRecords: {
        orderBy: { performedAt: "desc" },
        take: 5,
      },
      appointments: {
        orderBy: { scheduledAt: "desc" },
        take: 5,
        include: {
          vet: {
            select: { name: true },
          },
        },
      },
      medicalRecords: {
        orderBy: { visitDate: "desc" },
        take: 5,
        include: {
          vet: {
            select: { name: true },
          },
        },
      },
    },
  })

  if (!patient) {
    notFound()
  }

  const age = patient.birthDate
    ? Math.floor(
        (Date.now() - new Date(patient.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      )
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/pacientes"
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
            <p className="text-muted-foreground">
              {SPECIES_LABELS[patient.species]} {patient.breed && `- ${patient.breed}`}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/pacientes/${patient.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info Principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              Informacion del Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Especie</p>
                <p className="font-medium">{SPECIES_LABELS[patient.species]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Raza</p>
                <p className="font-medium">{patient.breed || "No especificada"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Genero</p>
                <p className="font-medium">{GENDER_LABELS[patient.gender]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">{patient.color || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                <p className="font-medium">
                  {patient.birthDate
                    ? format(new Date(patient.birthDate), "PPP", { locale: es })
                    : "No especificada"}
                  {age !== null && ` (${age} ${age === 1 ? "ano" : "anos"})`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="font-medium">
                  {patient.weight ? `${patient.weight} kg` : "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Numero de Chip</p>
                <p className="font-medium">{patient.chipNumber || "No tiene"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={patient.isDeceased ? "destructive" : "success"}>
                  {patient.isDeceased ? "Fallecido" : "Activo"}
                </Badge>
              </div>
            </div>

            {patient.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="mt-1 whitespace-pre-wrap">{patient.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Propietario */}
        <Card>
          <CardHeader>
            <CardTitle>Propietario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">
                {patient.owner.firstName} {patient.owner.lastName}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.owner.phone}</span>
              </div>
              {patient.owner.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.owner.email}</span>
                </div>
              )}
              {patient.owner.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.owner.address}</span>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/propietarios/${patient.owner.id}`}>
                Ver Propietario
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Vacunas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5" />
                  Vacunas
                </CardTitle>
                <CardDescription>Historial de vacunacion</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/pacientes/${patient.id}/vacunas/nueva`}>
                  Nueva
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patient.vaccinations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay vacunas registradas</p>
            ) : (
              <div className="space-y-2">
                {patient.vaccinations.map((vax) => (
                  <div key={vax.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div>
                      <p className="font-medium text-sm">{vax.vaccineName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(vax.administeredAt), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    {vax.nextDueDate && (
                      <Badge
                        variant={new Date(vax.nextDueDate) < new Date() ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        {new Date(vax.nextDueDate) < new Date() ? "Vencida" : format(new Date(vax.nextDueDate), "dd/MM/yy")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Desparasitaciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Desparasitaciones
                </CardTitle>
                <CardDescription>Historial de desparasitacion</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/pacientes/${patient.id}/desparasitaciones/nueva`}>
                  Nueva
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patient.dewormings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay desparasitaciones registradas</p>
            ) : (
              <div className="space-y-2">
                {patient.dewormings.map((dew) => (
                  <div key={dew.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div>
                      <p className="font-medium text-sm">{dew.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(dew.administeredAt), "d MMM yyyy", { locale: es })}
                        {dew.productType && ` - ${dew.productType}`}
                      </p>
                    </div>
                    {dew.nextDueDate && (
                      <Badge
                        variant={new Date(dew.nextDueDate) < new Date() ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        {new Date(dew.nextDueDate) < new Date() ? "Vencida" : format(new Date(dew.nextDueDate), "dd/MM/yy")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Procedimientos Dentales */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5" />
                  Procedimientos Dentales
                </CardTitle>
                <CardDescription>Historial dental</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/pacientes/${patient.id}/dental/nuevo`}>
                  Nuevo
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patient.dentalRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay procedimientos dentales registrados</p>
            ) : (
              <div className="space-y-2">
                {patient.dentalRecords.map((dental) => (
                  <div key={dental.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div>
                      <p className="font-medium text-sm">{dental.procedure}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(dental.performedAt), "d MMM yyyy", { locale: es })}
                        {dental.anesthesia && " • Con anestesia"}
                      </p>
                    </div>
                    {dental.nextCheckup && (
                      <Badge
                        variant={new Date(dental.nextCheckup) < new Date() ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        {new Date(dental.nextCheckup) < new Date() ? "Vencido" : format(new Date(dental.nextCheckup), "dd/MM/yy")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resultados de Laboratorio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Laboratorio
                </CardTitle>
                <CardDescription>Resultados de análisis</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/pacientes/${patient.id}/laboratorio/nuevo`}>
                  Nuevo
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patient.labResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay resultados de laboratorio</p>
            ) : (
              <div className="space-y-2">
                {patient.labResults.map((lab) => (
                  <div key={lab.id} className="rounded-lg border p-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{lab.testType}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(lab.sampleDate), "dd/MM/yy")}
                      </p>
                    </div>
                    {lab.testName && (
                      <p className="text-xs text-muted-foreground">{lab.testName}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estudios de Rayos X */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Rayos X
                </CardTitle>
                <CardDescription>Estudios radiográficos</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/pacientes/${patient.id}/rayos-x/nuevo`}>
                  Nuevo
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patient.xrayRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay estudios de rayos X</p>
            ) : (
              <div className="space-y-2">
                {patient.xrayRecords.map((xray) => (
                  <div key={xray.id} className="rounded-lg border p-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{xray.bodyPart}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(xray.performedAt), "dd/MM/yy")}
                      </p>
                    </div>
                    {xray.diagnosis && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{xray.diagnosis}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Citas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Citas Recientes
            </CardTitle>
            <CardDescription>Ultimas citas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            {patient.appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay citas registradas</p>
            ) : (
              <div className="space-y-3">
                {patient.appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{apt.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.scheduledAt), "PPP", { locale: es })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        apt.status === "COMPLETED"
                          ? "success"
                          : apt.status === "CANCELED"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial Medico */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Historial Medico
                </CardTitle>
                <CardDescription>Ultimas consultas</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/pacientes/${patient.id}/expediente/nuevo`}>
                  Nuevo
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patient.medicalRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay registros medicos</p>
            ) : (
              <div className="space-y-3">
                {patient.medicalRecords.map((record) => (
                  <Link
                    key={record.id}
                    href={`/pacientes/${patient.id}/expediente/${record.id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {record.diagnosis || "Consulta"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.visitDate), "dd/MM/yy")}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dr. {record.vet.name}
                    </p>
                    {record.chiefComplaint && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {record.chiefComplaint}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline del Historial */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Línea de Tiempo
            </CardTitle>
            <CardDescription>
              Historial completo del paciente ordenado cronológicamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientTimeline patientId={patient.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
