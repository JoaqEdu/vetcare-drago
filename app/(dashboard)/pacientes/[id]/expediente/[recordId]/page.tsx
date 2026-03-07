import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Thermometer,
  Heart,
  Wind,
  Scale,
  Stethoscope,
  Pill,
  ClipboardList,
  Activity,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExportMedicalRecordButton } from "@/components/pdf/export-medical-record-button"
import { FollowUpActions } from "@/components/medical-records/follow-up-actions"

export default async function MedicalRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>
}) {
  const { id, recordId } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const record = await db.medicalRecord.findFirst({
    where: {
      id: recordId,
      patientId: id,
    },
    include: {
      patient: {
        include: { owner: true },
      },
      vet: {
        select: { id: true, name: true, email: true },
      },
      appointment: true,
      followUpAppointments: {
        include: {
          vet: {
            select: { name: true },
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
      },
    },
  })

  if (!record) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/pacientes/${id}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expediente Medico</h1>
            <p className="text-muted-foreground">
              {record.patient.name} - {format(new Date(record.visitDate), "PPP", { locale: es })}
            </p>
          </div>
        </div>
        <ExportMedicalRecordButton recordId={record.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Motivo de Consulta */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Motivo de Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.chiefComplaint ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Motivo Principal</p>
                <p className="mt-1 whitespace-pre-wrap">{record.chiefComplaint}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No especificado</p>
            )}

            {record.presentIllness && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Historia de la Enfermedad</p>
                  <p className="mt-1 whitespace-pre-wrap">{record.presentIllness}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info de la Consulta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informacion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fecha</span>
              <span className="font-medium">
                {format(new Date(record.visitDate), "d MMM yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Veterinario</span>
              <span className="font-medium">{record.vet.name}</span>
            </div>
            {record.appointment && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cita Asociada</span>
                <Link href={`/citas/${record.appointment.id}`}>
                  <Badge variant="outline" className="cursor-pointer">
                    {record.appointment.type}
                  </Badge>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signos Vitales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Signos Vitales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="font-medium">
                    {record.weight ? `${record.weight} kg` : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="font-medium">
                    {record.temperature ? `${record.temperature} °C` : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">F. Cardiaca</p>
                  <p className="font-medium">
                    {record.heartRate ? `${record.heartRate} lpm` : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">F. Respiratoria</p>
                  <p className="font-medium">
                    {record.respiratoryRate ? `${record.respiratoryRate} rpm` : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostico */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Diagnostico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.diagnosis ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diagnostico Principal</p>
                <p className="mt-1 font-medium">{record.diagnosis}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No especificado</p>
            )}

            {record.differentialDx && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diagnosticos Diferenciales</p>
                  <p className="mt-1">{record.differentialDx}</p>
                </div>
              </>
            )}

            {record.prognosis && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pronostico</p>
                  <Badge variant="outline" className="mt-1">{record.prognosis}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tratamiento */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                <CardTitle>Plan de Tratamiento</CardTitle>
                {record.treatmentStatus && (
                  <Badge
                    variant={record.treatmentStatus === "ACTIVE" ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {record.treatmentStatus === "ACTIVE" ? "Tratamiento Activo" : "Tratamiento Completado"}
                  </Badge>
                )}
              </div>
              <FollowUpActions
                recordId={record.id}
                patientId={id}
                treatmentStatus={record.treatmentStatus}
                requiresFollowUp={record.requiresFollowUp}
              />
            </div>
            {record.requiresFollowUp && (
              <CardDescription className="mt-2">
                Este expediente requiere seguimiento post-tratamiento
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tratamiento</p>
                {record.treatment ? (
                  <p className="mt-1 whitespace-pre-wrap">{record.treatment}</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No especificado</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recomendaciones</p>
                {record.recommendations ? (
                  <p className="mt-1 whitespace-pre-wrap">{record.recommendations}</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No especificadas</p>
                )}
              </div>
            </div>

            {record.followUpDate && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Fecha de seguimiento:{" "}
                    <span className="font-medium">
                      {format(new Date(record.followUpDate), "PPP", { locale: es })}
                    </span>
                  </span>
                </div>
              </>
            )}

            {record.internalNotes && (
              <>
                <Separator className="my-4" />
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium text-muted-foreground">Notas Internas</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{record.internalNotes}</p>
                </div>
              </>
            )}

            {/* Citas de Seguimiento */}
            {record.followUpAppointments.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Citas de Seguimiento Programadas
                    </p>
                  </div>
                  <div className="space-y-2">
                    {record.followUpAppointments.map((appointment) => (
                      <Link
                        key={appointment.id}
                        href={`/citas/${appointment.id}`}
                        className="block rounded-lg border p-3 transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {format(new Date(appointment.scheduledAt), "PPP 'a las' p", { locale: es })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Dr. {appointment.vet.name}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            appointment.status === "COMPLETED" ? "secondary" :
                            appointment.status === "CANCELED" ? "destructive" :
                            "default"
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {appointment.notes}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
