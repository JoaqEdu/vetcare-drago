"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

export default function NotificacionesPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [vaccinationReminders, setVaccinationReminders] = useState(true)
  const [newAppointments, setNewAppointments] = useState(true)
  const [systemUpdates, setSystemUpdates] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/configuracion"
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">
            Configura tus preferencias de notificaciones y alertas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias de Notificaciones</CardTitle>
          <CardDescription>
            Elige qué notificaciones deseas recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">
                Notificaciones por Email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones importantes por correo electrónico
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Separator />

          {/* Appointment Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointment-reminders">
                Recordatorios de Citas
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe recordatorios 24 horas antes de cada cita
              </p>
            </div>
            <Switch
              id="appointment-reminders"
              checked={appointmentReminders}
              onCheckedChange={setAppointmentReminders}
            />
          </div>

          <Separator />

          {/* Vaccination Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vaccination-reminders">
                Recordatorios de Vacunación
              </Label>
              <p className="text-sm text-muted-foreground">
                Notificaciones de vacunas próximas a vencer
              </p>
            </div>
            <Switch
              id="vaccination-reminders"
              checked={vaccinationReminders}
              onCheckedChange={setVaccinationReminders}
            />
          </div>

          <Separator />

          {/* New Appointments */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-appointments">Nuevas Citas</Label>
              <p className="text-sm text-muted-foreground">
                Notificación cuando se agenda una nueva cita
              </p>
            </div>
            <Switch
              id="new-appointments"
              checked={newAppointments}
              onCheckedChange={setNewAppointments}
            />
          </div>

          <Separator />

          {/* System Updates */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-updates">
                Actualizaciones del Sistema
              </Label>
              <p className="text-sm text-muted-foreground">
                Notificaciones sobre nuevas funciones y actualizaciones
              </p>
            </div>
            <Switch
              id="system-updates"
              checked={systemUpdates}
              onCheckedChange={setSystemUpdates}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horario de Notificaciones</CardTitle>
          <CardDescription>
            Las notificaciones se enviarán dentro de este horario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Horario de Oficina</Label>
              <p className="text-sm text-muted-foreground">
                Lunes a Viernes: 9:00 AM - 6:00 PM
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Las notificaciones urgentes se enviarán en cualquier momento
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
