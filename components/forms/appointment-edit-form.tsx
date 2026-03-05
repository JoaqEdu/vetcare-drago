"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc"

const APPOINTMENT_TYPES = [
  { value: "CHECKUP", label: "Consulta" },
  { value: "VACCINATION", label: "Vacunacion" },
  { value: "SURGERY", label: "Cirugia" },
  { value: "EMERGENCY", label: "Emergencia" },
  { value: "GROOMING", label: "Estetica" },
  { value: "DENTAL", label: "Dental" },
  { value: "LABORATORY", label: "Laboratorio" },
  { value: "XRAY", label: "Rayos X" },
  { value: "FOLLOWUP", label: "Seguimiento" },
  { value: "OTHER", label: "Otro" },
]

const APPOINTMENT_STATUSES = [
  { value: "SCHEDULED", label: "Programada" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "IN_PROGRESS", label: "En curso" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELED", label: "Cancelada" },
  { value: "NO_SHOW", label: "No asistio" },
]

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1.5 horas" },
  { value: "120", label: "2 horas" },
]

interface Appointment {
  id: string
  scheduledAt: Date
  duration: number
  type: string
  status: string
  reason: string | null
  notes: string | null
  vetId: string
  patient: {
    id: string
    name: string
    owner: {
      firstName: string
      lastName: string
    }
  }
}

interface AppointmentEditFormProps {
  appointment: Appointment
}

export function AppointmentEditForm({ appointment }: AppointmentEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const scheduledAt = new Date(appointment.scheduledAt)

  const [formData, setFormData] = useState({
    vetId: appointment.vetId,
    scheduledDate: scheduledAt as Date | undefined,
    scheduledTime: format(scheduledAt, "HH:mm"),
    duration: appointment.duration.toString(),
    type: appointment.type,
    status: appointment.status,
    reason: appointment.reason || "",
    notes: appointment.notes || "",
  })

  // Fetch vets for selection
  const { data: vets, isLoading: loadingVets } = trpc.appointments.getVets.useQuery()

  const updateAppointment = trpc.appointments.update.useMutation({
    onSuccess: () => {
      router.push(`/citas/${appointment.id}`)
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al actualizar la cita")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.vetId) {
      setError("Selecciona un veterinario")
      return
    }

    if (!formData.scheduledDate) {
      setError("Selecciona una fecha")
      return
    }

    setIsSubmitting(true)

    // Combine date and time
    const [hours, minutes] = formData.scheduledTime.split(":").map(Number)
    const newScheduledAt = new Date(formData.scheduledDate)
    newScheduledAt.setHours(hours, minutes, 0, 0)

    updateAppointment.mutate({
      id: appointment.id,
      vetId: formData.vetId,
      scheduledAt: newScheduledAt,
      duration: parseInt(formData.duration),
      type: formData.type as "CHECKUP" | "VACCINATION" | "SURGERY" | "EMERGENCY" | "GROOMING" | "DENTAL" | "LABORATORY" | "XRAY" | "FOLLOWUP" | "OTHER",
      status: formData.status as "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW",
      reason: formData.reason || undefined,
      notes: formData.notes || undefined,
    })
  }

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informacion de la Cita */}
        <Card>
          <CardHeader>
            <CardTitle>Informacion de la Cita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Paciente (read only) */}
            <div className="space-y-2">
              <Label>Paciente</Label>
              <div className="rounded-md border bg-muted/50 p-3">
                <p className="font-medium">{appointment.patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.patient.owner.firstName} {appointment.patient.owner.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vetId">Veterinario *</Label>
              <Select
                value={formData.vetId}
                onValueChange={(value) => handleChange("vetId", value)}
                disabled={isSubmitting || loadingVets}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar veterinario" />
                </SelectTrigger>
                <SelectContent>
                  {vets?.map((vet) => (
                    <SelectItem key={vet.id} value={vet.id}>
                      {vet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cita *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de la Consulta</Label>
              <Textarea
                id="reason"
                placeholder="Describe el motivo de la cita..."
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fecha y Hora */}
        <Card>
          <CardHeader>
            <CardTitle>Fecha y Hora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.scheduledDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledDate ? (
                      format(formData.scheduledDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={(date) => handleChange("scheduledDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Hora *</Label>
                <Select
                  value={formData.scheduledTime}
                  onValueChange={(value) => handleChange("scheduledTime", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0")
                      return [
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>,
                        <SelectItem key={`${hour}:30`} value={`${hour}:30`}>
                          {hour}:30
                        </SelectItem>,
                      ]
                    }).flat()}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duracion</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => handleChange("duration", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Duracion" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Notas internas sobre la cita..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </Button>
      </div>
    </form>
  )
}
