"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  PawPrint,
  Calendar,
  FileText,
  Syringe,
  Phone,
  Mail,
  User,
  Scissors,
  Stethoscope,
  AlertCircle,
  Activity,
  Microscope,
  X as XRay,
  ClipboardList,
  Pill,
  Bug,
  Smile,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tipos e iconos para cada categoría
const APPOINTMENT_TYPES: Record<string, { label: string; icon: any; color: string }> = {
  CHECKUP: { label: "Consulta General", icon: Stethoscope, color: "text-blue-600" },
  VACCINATION: { label: "Vacunación", icon: Syringe, color: "text-green-600" },
  DEWORMING: { label: "Desparasitación", icon: Bug, color: "text-orange-600" },
  SURGERY: { label: "Cirugía", icon: Activity, color: "text-red-600" },
  EMERGENCY: { label: "Emergencia", icon: AlertCircle, color: "text-amber-600" },
  GROOMING: { label: "Estética", icon: Scissors, color: "text-purple-600" },
  DENTAL: { label: "Dental", icon: ClipboardList, color: "text-cyan-600" },
  LABORATORY: { label: "Laboratorio", icon: Microscope, color: "text-indigo-600" },
  XRAY: { label: "Rayos X", icon: XRay, color: "text-slate-600" },
  FOLLOWUP: { label: "Seguimiento", icon: ClipboardList, color: "text-teal-600" },
  OTHER: { label: "Otro", icon: FileText, color: "text-gray-600" },
}

interface PortalClientProps {
  owner: any
}

export function PortalClient({ owner }: PortalClientProps) {
  const [selectedPet, setSelectedPet] = useState(owner.patients[0]?.id || null)

  if (!owner) {
    notFound()
  }

  const currentPet = owner.patients.find((p: any) => p.id === selectedPet)

  const now = new Date()

  // Separar citas por tipo y estado
  const medicalAppointments = currentPet?.appointments.filter((apt: any) =>
    !["GROOMING", "VACCINATION"].includes(apt.type) &&
    ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"].includes(apt.status) &&
    new Date(apt.scheduledAt) >= now
  ) || []

  const groomingAppointments = currentPet?.appointments.filter((apt: any) =>
    apt.type === "GROOMING" &&
    ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"].includes(apt.status) &&
    new Date(apt.scheduledAt) >= now
  ) || []

  const groomingHistory = currentPet?.appointments.filter((apt: any) =>
    apt.type === "GROOMING" &&
    apt.status === "COMPLETED"
  ) || []

  const vaccinationAppointments = currentPet?.appointments.filter((apt: any) =>
    apt.type === "VACCINATION" &&
    ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"].includes(apt.status) &&
    new Date(apt.scheduledAt) >= now
  ) || []

  // Separar vacunas pendientes vs historial
  const pendingVaccinations = currentPet?.vaccinations.filter((vax: any) =>
    vax.nextDueDate && new Date(vax.nextDueDate) >= now
  ) || []

  const vaccinationHistory = currentPet?.vaccinations || []

  // Separar desparasitaciones pendientes vs historial
  const pendingDewormings = currentPet?.dewormings?.filter((dew: any) =>
    dew.nextDueDate && new Date(dew.nextDueDate) >= now
  ) || []

  const dewormingHistory = currentPet?.dewormings || []

  // Separar procedimientos dentales pendientes vs historial
  const pendingDental = currentPet?.dentalRecords?.filter((dental: any) =>
    dental.nextCheckup && new Date(dental.nextCheckup) >= now
  ) || []

  const dentalHistory = currentPet?.dentalRecords || []

  // Agrupar historial médico por tipo
  const groupedHistory = currentPet?.medicalRecords.reduce((acc: any, record: any) => {
    const appointment = currentPet.appointments.find((apt: any) =>
      apt.medicalRecord?.id === record.id
    )

    const type = appointment?.type || 'CHECKUP'

    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(record)
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Portal del Cliente</h1>
              <p className="text-muted-foreground">
                Bienvenido/a, {owner.firstName} {owner.lastName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PawPrint className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">VetCare Drago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mi Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{owner.phone}</span>
              </div>
              {owner.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{owner.email}</span>
                </div>
              )}
              {owner.address && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Dirección:</span>
                  <span>{owner.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mascotas con Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5" />
                Mis Mascotas ({owner.patients.length})
              </CardTitle>
              <CardDescription>
                Información médica y citas de tus compañeros
              </CardDescription>
            </CardHeader>
            <CardContent>
              {owner.patients.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No tienes mascotas registradas
                </p>
              ) : (
                <Tabs value={selectedPet} onValueChange={setSelectedPet}>
                  {/* Tabs de mascotas */}
                  {owner.patients.length > 1 && (
                    <TabsList className="grid w-full mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(owner.patients.length, 4)}, 1fr)` }}>
                      {owner.patients.map((patient: any) => (
                        <TabsTrigger key={patient.id} value={patient.id} className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4" />
                          <span className="truncate">{patient.name}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  )}

                  {/* Contenido de cada mascota */}
                  {owner.patients.map((patient: any) => (
                    <TabsContent key={patient.id} value={patient.id} className="space-y-6">
                      {/* Información básica de la mascota */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <PawPrint className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{patient.name}</h3>
                          <p className="text-muted-foreground">
                            {patient.species} {patient.breed && `• ${patient.breed}`}
                          </p>
                          {patient.weight && (
                            <p className="text-sm text-muted-foreground">Peso: {patient.weight} kg</p>
                          )}
                        </div>
                      </div>

                      {/* Navegación principal */}
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 mb-6 h-auto gap-1">
                          <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-2 py-3">
                            <Calendar className="h-5 w-5" />
                            <span className="text-xs sm:text-sm">Resumen</span>
                          </TabsTrigger>
                          <TabsTrigger value="vaccines" className="flex flex-col sm:flex-row items-center gap-2 py-3">
                            <Syringe className="h-5 w-5" />
                            <span className="text-xs sm:text-sm">Vacunas</span>
                          </TabsTrigger>
                          <TabsTrigger value="deworming" className="flex flex-col sm:flex-row items-center gap-2 py-3">
                            <Bug className="h-5 w-5" />
                            <span className="text-xs sm:text-sm">Desparasit.</span>
                          </TabsTrigger>
                          <TabsTrigger value="dental" className="flex flex-col sm:flex-row items-center gap-2 py-3">
                            <Smile className="h-5 w-5" />
                            <span className="text-xs sm:text-sm">Dental</span>
                          </TabsTrigger>
                          <TabsTrigger value="grooming" className="flex flex-col sm:flex-row items-center gap-2 py-3">
                            <Scissors className="h-5 w-5" />
                            <span className="text-xs sm:text-sm">Estética</span>
                          </TabsTrigger>
                          <TabsTrigger value="medical" className="flex flex-col sm:flex-row items-center gap-2 py-3">
                            <FileText className="h-5 w-5" />
                            <span className="text-xs sm:text-sm">Historial</span>
                          </TabsTrigger>
                        </TabsList>

                        {/* TAB: RESUMEN */}
                        <TabsContent value="overview" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Próximas Citas Médicas</CardTitle>
                              <CardDescription>
                                Consultas, cirugías y otros procedimientos programados
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {medicalAppointments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                  No hay citas médicas programadas
                                </p>
                              ) : (
                                <div className="grid gap-4">
                                  {medicalAppointments.map((apt: any) => {
                                    const typeInfo = APPOINTMENT_TYPES[apt.type] || APPOINTMENT_TYPES.OTHER
                                    const Icon = typeInfo.icon

                                    return (
                                      <div
                                        key={apt.id}
                                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                      >
                                        <div className={`mt-1 ${typeInfo.color}`}>
                                          <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <h4 className="font-semibold">
                                                {typeInfo.label}
                                                {apt.type === "VACCINATION" && apt.vaccineName && (
                                                  <span className="text-muted-foreground"> - {apt.vaccineName}</span>
                                                )}
                                              </h4>
                                              <p className="text-sm text-muted-foreground">
                                                {format(new Date(apt.scheduledAt), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                                  locale: es,
                                                })}
                                              </p>
                                            </div>
                                            <Badge variant="secondary">
                                              {format(new Date(apt.scheduledAt), "d MMM", { locale: es })}
                                            </Badge>
                                          </div>
                                          {apt.reason && (
                                            <p className="text-sm text-muted-foreground">{apt.reason}</p>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Próximas Vacunaciones */}
                          {vaccinationAppointments.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Syringe className="h-5 w-5" />
                                  Próximas Vacunaciones
                                </CardTitle>
                                <CardDescription>
                                  Citas de vacunación programadas
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-4">
                                  {vaccinationAppointments.map((apt: any) => (
                                    <div
                                      key={apt.id}
                                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                      <Syringe className="h-6 w-6 text-green-600 mt-1" />
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <h4 className="font-semibold">
                                              Vacunación{apt.vaccineName && ` - ${apt.vaccineName}`}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                              {format(new Date(apt.scheduledAt), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                                locale: es,
                                              })}
                                            </p>
                                            {apt.vaccineManufacturer && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                Laboratorio: {apt.vaccineManufacturer}
                                              </p>
                                            )}
                                          </div>
                                          <Badge variant="secondary">
                                            {format(new Date(apt.scheduledAt), "d MMM", { locale: es })}
                                          </Badge>
                                        </div>
                                        {apt.reason && (
                                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Próximas Citas de Estética */}
                          {groomingAppointments.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Scissors className="h-5 w-5" />
                                  Próximas Citas de Estética
                                </CardTitle>
                                <CardDescription>
                                  Baños y servicios de belleza programados
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-4">
                                  {groomingAppointments.map((apt: any) => (
                                    <div
                                      key={apt.id}
                                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                      <Scissors className="h-6 w-6 text-blue-600 mt-1" />
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <h4 className="font-semibold">Servicio de Estética</h4>
                                            <p className="text-sm text-muted-foreground">
                                              {format(new Date(apt.scheduledAt), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                                locale: es,
                                              })}
                                            </p>
                                          </div>
                                          <Badge variant="secondary">
                                            {format(new Date(apt.scheduledAt), "d MMM", { locale: es })}
                                          </Badge>
                                        </div>
                                        {apt.reason && (
                                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        {/* TAB: VACUNAS */}
                        <TabsContent value="vaccines" className="space-y-6">
                          {/* Citas de vacunación programadas */}
                          {vaccinationAppointments.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Calendar className="h-5 w-5" />
                                  Citas de Vacunación Programadas
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-3">
                                  {vaccinationAppointments.map((apt: any) => (
                                    <div
                                      key={apt.id}
                                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                      <Syringe className="h-6 w-6 text-green-600 mt-1" />
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <h4 className="font-semibold">
                                              Vacunación{apt.vaccineName && ` - ${apt.vaccineName}`}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                              {format(new Date(apt.scheduledAt), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                                locale: es,
                                              })}
                                            </p>
                                            {apt.vaccineManufacturer && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {apt.vaccineManufacturer}
                                              </p>
                                            )}
                                          </div>
                                          <Badge variant="secondary">
                                            {format(new Date(apt.scheduledAt), "d MMM", { locale: es })}
                                          </Badge>
                                        </div>
                                        {apt.reason && (
                                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Vacunas pendientes */}
                          {pendingVaccinations.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-amber-600" />
                                  Vacunas Por Aplicar
                                </CardTitle>
                                <CardDescription>
                                  Vacunas que están próximas a vencer
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-3">
                                  {pendingVaccinations.map((vax: any) => (
                                    <div
                                      key={vax.id}
                                      className="flex items-center justify-between p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Syringe className="h-5 w-5 text-amber-600" />
                                        <div>
                                          <p className="font-medium">{vax.vaccineName}</p>
                                          {vax.nextDueDate && (
                                            <p className="text-sm text-muted-foreground">
                                              Vence: {format(new Date(vax.nextDueDate), "d 'de' MMMM, yyyy", {
                                                locale: es,
                                              })}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <Badge variant="secondary">Pendiente</Badge>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Historial de vacunas */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Historial de Vacunación
                              </CardTitle>
                              <CardDescription>
                                Todas las vacunas aplicadas a {patient.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {vaccinationHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                  No hay vacunas registradas
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {vaccinationHistory.map((vax: any) => (
                                    <div
                                      key={vax.id}
                                      className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                                    >
                                      <Syringe className="h-5 w-5 text-green-600 mt-1" />
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <h4 className="font-semibold">{vax.vaccineName}</h4>
                                            <p className="text-sm text-muted-foreground">
                                              Aplicada: {format(new Date(vax.administeredAt), "d 'de' MMMM, yyyy", {
                                                locale: es,
                                              })}
                                            </p>
                                            {vax.manufacturer && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {vax.manufacturer} {vax.batchNumber && `• Lote: ${vax.batchNumber}`}
                                              </p>
                                            )}
                                            {vax.nextDueDate && new Date(vax.nextDueDate) >= now && (
                                              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Próxima dosis: {format(new Date(vax.nextDueDate), "d 'de' MMM, yyyy", { locale: es })}
                                              </p>
                                            )}
                                          </div>
                                          <Badge variant="outline">Aplicada</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* TAB: DESPARASITACIONES */}
                        <TabsContent value="deworming" className="space-y-6">
                          {/* Desparasitaciones pendientes */}
                          {pendingDewormings.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-amber-600" />
                                  Desparasitaciones Pendientes
                                </CardTitle>
                                <CardDescription>
                                  Desparasitaciones próximas o vencidas
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-3">
                                  {pendingDewormings.map((dew: any) => (
                                    <div
                                      key={dew.id}
                                      className="flex items-center justify-between p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Bug className="h-5 w-5 text-amber-600" />
                                        <div>
                                          <p className="font-medium">{dew.productName}</p>
                                          {dew.productType && (
                                            <p className="text-xs text-muted-foreground">
                                              {dew.productType}
                                            </p>
                                          )}
                                          {dew.nextDueDate && (
                                            <p className="text-sm text-muted-foreground">
                                              Próxima: {format(new Date(dew.nextDueDate), "d 'de' MMMM, yyyy", {
                                                locale: es,
                                              })}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <Badge
                                        variant={
                                          new Date(dew.nextDueDate) < now ? "destructive" : "secondary"
                                        }
                                      >
                                        {new Date(dew.nextDueDate) < now ? "Vencida" : "Próxima"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Historial de desparasitaciones */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Bug className="h-5 w-5" />
                                Historial de Desparasitaciones
                              </CardTitle>
                              <CardDescription>
                                Registro completo de desparasitaciones aplicadas a {currentPet?.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {dewormingHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                  No hay desparasitaciones registradas
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {dewormingHistory.map((dew: any) => (
                                    <div
                                      key={dew.id}
                                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                                    >
                                      <Bug className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <h4 className="font-semibold">{dew.productName}</h4>
                                            {dew.productType && (
                                              <p className="text-sm text-muted-foreground">
                                                Tipo: {dew.productType}
                                              </p>
                                            )}
                                            {dew.manufacturer && (
                                              <p className="text-xs text-muted-foreground">
                                                Laboratorio: {dew.manufacturer}
                                              </p>
                                            )}
                                            {dew.dose && (
                                              <p className="text-xs text-muted-foreground">
                                                Dosis: {dew.dose}
                                              </p>
                                            )}
                                            {dew.weight && (
                                              <p className="text-xs text-muted-foreground">
                                                Peso al momento: {dew.weight} kg
                                              </p>
                                            )}
                                            {dew.notes && (
                                              <p className="text-sm text-muted-foreground mt-2">
                                                {dew.notes}
                                              </p>
                                            )}
                                          </div>
                                          <Badge variant="outline">
                                            {format(new Date(dew.administeredAt), "d MMM yyyy", {
                                              locale: es,
                                            })}
                                          </Badge>
                                        </div>
                                        {dew.nextDueDate && (
                                          <div className="pt-2 mt-2 border-t">
                                            <p className="text-sm text-muted-foreground">
                                              Próxima desparasitación:{" "}
                                              <span className="font-medium text-foreground">
                                                {format(new Date(dew.nextDueDate), "d 'de' MMMM, yyyy", {
                                                  locale: es,
                                                })}
                                              </span>
                                              {dew.nextDewormingType && ` - ${dew.nextDewormingType}`}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* TAB: PROCEDIMIENTOS DENTALES */}
                        <TabsContent value="dental" className="space-y-6">
                          {/* Chequeos dentales pendientes */}
                          {pendingDental.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-cyan-600" />
                                  Chequeos Dentales Pendientes
                                </CardTitle>
                                <CardDescription>
                                  Chequeos dentales próximos programados
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {pendingDental.map((dental: any) => (
                                    <div
                                      key={dental.id}
                                      className="flex items-start gap-4 rounded-lg border p-4 bg-cyan-50 dark:bg-cyan-950/20"
                                    >
                                      <Smile className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 space-y-1">
                                        <h4 className="font-semibold">{dental.procedure}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Próximo chequeo:{" "}
                                          <span className="font-medium text-foreground">
                                            {format(new Date(dental.nextCheckup), "d 'de' MMMM, yyyy", {
                                              locale: es,
                                            })}
                                          </span>
                                        </p>
                                        {new Date(dental.nextCheckup) < now && (
                                          <Badge variant="destructive" className="mt-2">
                                            Chequeo vencido
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Historial de procedimientos dentales */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Smile className="h-5 w-5" />
                                Historial de Procedimientos Dentales
                              </CardTitle>
                              <CardDescription>
                                Registro completo de procedimientos dentales realizados a {currentPet?.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {dentalHistory.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                  No hay procedimientos dentales registrados
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  {dentalHistory.map((dental: any) => (
                                    <div
                                      key={dental.id}
                                      className="flex items-start gap-4 rounded-lg border p-4"
                                    >
                                      <Smile className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <h4 className="font-semibold">{dental.procedure}</h4>
                                            {dental.teethAffected && (
                                              <p className="text-sm text-muted-foreground">
                                                Dientes afectados: {dental.teethAffected}
                                              </p>
                                            )}
                                            {dental.findings && (
                                              <p className="text-sm text-muted-foreground mt-1">
                                                Hallazgos: {dental.findings}
                                              </p>
                                            )}
                                            {dental.treatment && (
                                              <p className="text-sm text-muted-foreground mt-1">
                                                Tratamiento: {dental.treatment}
                                              </p>
                                            )}
                                            {dental.anesthesia && (
                                              <Badge variant="secondary" className="mt-2">
                                                Con anestesia
                                              </Badge>
                                            )}
                                            {dental.notes && (
                                              <p className="text-sm text-muted-foreground mt-2">
                                                {dental.notes}
                                              </p>
                                            )}
                                          </div>
                                          <Badge variant="outline">
                                            {format(new Date(dental.performedAt), "d MMM yyyy", {
                                              locale: es,
                                            })}
                                          </Badge>
                                        </div>
                                        {dental.nextCheckup && (
                                          <div className="pt-2 mt-2 border-t">
                                            <p className="text-sm text-muted-foreground">
                                              Próximo chequeo:{" "}
                                              <span className="font-medium text-foreground">
                                                {format(new Date(dental.nextCheckup), "d 'de' MMMM, yyyy", {
                                                  locale: es,
                                                })}
                                              </span>
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* TAB: ESTÉTICA */}
                        <TabsContent value="grooming" className="space-y-6">
                          {/* Próximos baños */}
                          {groomingAppointments.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Calendar className="h-5 w-5" />
                                  Citas de Estética Programadas
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-3">
                                  {groomingAppointments.map((apt: any) => (
                                    <div
                                      key={apt.id}
                                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                      <Scissors className="h-6 w-6 text-purple-600 mt-1" />
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <h4 className="font-semibold">Baño y Estética</h4>
                                            <p className="text-sm text-muted-foreground">
                                              {format(new Date(apt.scheduledAt), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                                locale: es,
                                              })}
                                            </p>
                                          </div>
                                          <Badge variant="secondary">
                                            {format(new Date(apt.scheduledAt), "d MMM", { locale: es })}
                                          </Badge>
                                        </div>
                                        {apt.reason && (
                                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Historial de baños */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Historial de Baños y Estética
                              </CardTitle>
                              <CardDescription>
                                Registro completo de servicios de estética
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {groomingHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                  No hay historial de baños
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {groomingHistory.map((apt: any) => (
                                    <div
                                      key={apt.id}
                                      className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                                    >
                                      <Scissors className="h-5 w-5 text-purple-600 mt-1" />
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <h4 className="font-semibold">Baño y Estética</h4>
                                            <p className="text-sm text-muted-foreground">
                                              {format(new Date(apt.scheduledAt), "d 'de' MMMM, yyyy", {
                                                locale: es,
                                              })}
                                            </p>
                                            {apt.reason && (
                                              <p className="text-sm text-muted-foreground mt-1">{apt.reason}</p>
                                            )}
                                            {apt.notes && (
                                              <p className="text-xs text-muted-foreground mt-2 italic border-l-2 pl-2 border-muted">
                                                {apt.notes}
                                              </p>
                                            )}
                                          </div>
                                          <Badge variant="outline">Completado</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* TAB: HISTORIAL MÉDICO */}
                        <TabsContent value="medical" className="space-y-6">
                          {Object.keys(groupedHistory).length === 0 ? (
                            <Card>
                              <CardContent className="py-12">
                                <p className="text-center text-muted-foreground">
                                  No hay historial médico registrado
                                </p>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <FileText className="h-5 w-5" />
                                  Historial Médico Completo
                                </CardTitle>
                                <CardDescription>
                                  Registro de consultas y tratamientos agrupados por categoría
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Tabs defaultValue={Object.keys(groupedHistory)[0]} className="w-full">
                                  <TabsList className="grid w-full overflow-x-auto mb-6" style={{ gridTemplateColumns: `repeat(${Object.keys(groupedHistory).length}, minmax(100px, 1fr))` }}>
                                    {Object.keys(groupedHistory).map((type) => {
                                      const typeInfo = APPOINTMENT_TYPES[type] || APPOINTMENT_TYPES.OTHER
                                      const Icon = typeInfo.icon
                                      const count = groupedHistory[type].length

                                      return (
                                        <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                                          <Icon className="h-4 w-4" />
                                          <span className="hidden sm:inline">{typeInfo.label}</span>
                                          <Badge variant="secondary" className="ml-1">{count}</Badge>
                                        </TabsTrigger>
                                      )
                                    })}
                                  </TabsList>

                                  {Object.entries(groupedHistory).map(([type, records]: [string, any]) => {
                                    const typeInfo = APPOINTMENT_TYPES[type] || APPOINTMENT_TYPES.OTHER
                                    const Icon = typeInfo.icon

                                    return (
                                      <TabsContent key={type} value={type} className="mt-6 space-y-4">
                                        {records.map((record: any, index: number) => (
                                          <div key={record.id} className="space-y-3">
                                            <div className="flex gap-4">
                                              {/* Timeline */}
                                              <div className="flex flex-col items-center">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 ${typeInfo.color} border-current`}>
                                                  <Icon className="h-5 w-5" />
                                                </div>
                                                {index < records.length - 1 && (
                                                  <div className="w-0.5 h-full bg-border mt-2" />
                                                )}
                                              </div>

                                              {/* Contenido */}
                                              <div className="flex-1 pb-6">
                                                <div className="rounded-lg border p-4 bg-card space-y-3">
                                                  <div className="flex items-start justify-between">
                                                    <div>
                                                      <h4 className="font-semibold">
                                                        {record.diagnosis || typeInfo.label}
                                                      </h4>
                                                      <p className="text-sm text-muted-foreground">
                                                        {format(new Date(record.visitDate), "EEEE, d 'de' MMMM 'de' yyyy", {
                                                          locale: es,
                                                        })}
                                                      </p>
                                                    </div>
                                                  </div>

                                                  {record.chiefComplaint && (
                                                    <div>
                                                      <p className="text-sm font-medium text-muted-foreground">Motivo:</p>
                                                      <p className="text-sm">{record.chiefComplaint}</p>
                                                    </div>
                                                  )}

                                                  {record.treatment && (
                                                    <div>
                                                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                        <Pill className="h-4 w-4" />
                                                        Tratamiento:
                                                      </p>
                                                      <p className="text-sm">{record.treatment}</p>
                                                    </div>
                                                  )}

                                                  {(record.weight || record.temperature) && (
                                                    <div className="flex gap-4 text-sm">
                                                      {record.weight && (
                                                        <div>
                                                          <span className="text-muted-foreground">Peso:</span>{" "}
                                                          <span className="font-medium">{record.weight} kg</span>
                                                        </div>
                                                      )}
                                                      {record.temperature && (
                                                        <div>
                                                          <span className="text-muted-foreground">Temp:</span>{" "}
                                                          <span className="font-medium">{record.temperature}°C</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}

                                                  {record.recommendations && (
                                                    <div className="border-t pt-3">
                                                      <p className="text-sm font-medium text-muted-foreground">
                                                        Recomendaciones:
                                                      </p>
                                                      <p className="text-sm">{record.recommendations}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </TabsContent>
                                    )
                                  })}
                                </Tabs>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Footer Info */}
          <Card>
            <CardContent className="py-4">
              <p className="text-center text-sm text-muted-foreground">
                Para agendar citas o consultas, por favor contacta a la clínica al {owner.phone}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
