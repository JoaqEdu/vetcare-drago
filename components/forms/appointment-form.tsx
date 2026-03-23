"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  { value: "DEWORMING", label: "Desparasitacion" },
  { value: "SURGERY", label: "Cirugia" },
  { value: "EMERGENCY", label: "Emergencia" },
  { value: "GROOMING", label: "Estetica" },
  { value: "DENTAL", label: "Dental" },
  { value: "LABORATORY", label: "Laboratorio" },
  { value: "XRAY", label: "Rayos X" },
  { value: "FOLLOWUP", label: "Seguimiento" },
  { value: "OTHER", label: "Otro" },
]

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1.5 horas" },
  { value: "120", label: "2 horas" },
]

export function AppointmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const preselectedPatientId = searchParams.get("patientId")
  const preselectedType = searchParams.get("type")
  const parentRecordId = searchParams.get("parentRecordId")

  // Verificar si el usuario es veterinario (se auto-asigna)
  const isVet = session?.user?.role === "VET"
  const currentUserId = session?.user?.id

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [patientSearch, setPatientSearch] = useState("")

  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || "",
    vetId: "",
    scheduledDate: undefined as Date | undefined,
    scheduledTime: "09:00",
    duration: "30",
    type: preselectedType || "CHECKUP",
    reason: "",
    notes: "",
    // Campos para vacunación
    vaccineName: "",
    vaccineType: "",
    vaccineManufacturer: "",
  })

  // Si es veterinario, auto-asignar su ID
  useEffect(() => {
    if (isVet && currentUserId && !formData.vetId) {
      setFormData(prev => ({ ...prev, vetId: currentUserId }))
    }
  }, [isVet, currentUserId, formData.vetId])

  // Fetch patients for selection
  const { data: patientsData, isLoading: loadingPatients } = trpc.patients.list.useQuery({
    search: patientSearch || undefined,
    limit: 20,
  })

  // Fetch vets for selection (solo si no es VET)
  const { data: vets, isLoading: loadingVets } = trpc.appointments.getVets.useQuery(
    undefined,
    { enabled: !isVet }
  )

  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: () => {
      router.push("/citas")
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al crear la cita")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.patientId) {
      setError("Selecciona un paciente")
      return
    }

    if (!formData.vetId && !isVet) {
      setError("Selecciona un veterinario")
      return
    }

    if (!formData.scheduledDate) {
      setError("Selecciona una fecha")
      return
    }

    // Validar campos de vacunación si es tipo VACCINATION
    if (formData.type === "VACCINATION" && !formData.vaccineName.trim()) {
      setError("El nombre de la vacuna es requerido para citas de vacunación")
      return
    }

    setIsSubmitting(true)

    // Combine date and time
    const [hours, minutes] = formData.scheduledTime.split(":").map(Number)
    const scheduledAt = new Date(formData.scheduledDate)
    scheduledAt.setHours(hours, minutes, 0, 0)

    createAppointment.mutate({
      patientId: formData.patientId,
      vetId: formData.vetId,
      scheduledAt,
      duration: parseInt(formData.duration),
      type: formData.type as "CHECKUP" | "VACCINATION" | "SURGERY" | "EMERGENCY" | "GROOMING" | "DENTAL" | "LABORATORY" | "XRAY" | "FOLLOWUP" | "OTHER",
      reason: formData.reason || undefined,
      notes: formData.notes || undefined,
      // Campos de vacunación (solo si es tipo VACCINATION)
      vaccineName: formData.type === "VACCINATION" ? formData.vaccineName.trim() || undefined : undefined,
      vaccineType: formData.type === "VACCINATION" ? formData.vaccineType.trim() || undefined : undefined,
      vaccineManufacturer: formData.type === "VACCINATION" ? formData.vaccineManufacturer.trim() || undefined : undefined,
      // Vínculo con expediente médico (si es cita de seguimiento)
      parentRecordId: parentRecordId || undefined,
    })
  }

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const patients = patientsData?.patients ?? []
  const selectedPatient = patients.find((p) => p.id === formData.patientId)

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Paciente y Veterinario */}
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

            <div className="space-y-2">
              <Label htmlFor="patientSearch">Paciente *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="patientSearch"
                  placeholder="Buscar paciente..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              {selectedPatient && (
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="font-medium">{selectedPatient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.owner.firstName} {selectedPatient.owner.lastName} - {selectedPatient.owner.phone}
                  </p>
                </div>
              )}
              {loadingPatients ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando...
                </div>
              ) : patients.length > 0 && patientSearch && !selectedPatient ? (
                <div className="rounded-md border max-h-48 overflow-y-auto">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      className="w-full text-left p-3 hover:bg-accent transition-colors border-b last:border-b-0"
                      onClick={() => {
                        handleChange("patientId", patient.id)
                        setPatientSearch("")
                      }}
                    >
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.owner.firstName} {patient.owner.lastName}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vetId">Veterinario *</Label>
              {isVet ? (
                // Si es veterinario, mostrar su nombre (auto-asignado)
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">Asignado automaticamente</p>
                </div>
              ) : (
                // Si es admin/asistente, mostrar selector
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
              )}
            </div>

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

            {/* Campos específicos para vacunación */}
            {formData.type === "VACCINATION" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="vaccineName">Nombre de la Vacuna *</Label>
                  <Input
                    id="vaccineName"
                    placeholder="Ej: Rabia, Parvovirus, Quintuple..."
                    value={formData.vaccineName}
                    onChange={(e) => handleChange("vaccineName", e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Especifica qué vacuna se aplicará en esta cita
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vaccineType">Tipo de Vacuna</Label>
                    <Input
                      id="vaccineType"
                      placeholder="Ej: Inactivada, Atenuada, Recombinante..."
                      value={formData.vaccineType}
                      onChange={(e) => handleChange("vaccineType", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vaccineManufacturer">Laboratorio</Label>
                    <Input
                      id="vaccineManufacturer"
                      placeholder="Ej: Zoetis, MSD, Virbac..."
                      value={formData.vaccineManufacturer}
                      onChange={(e) => handleChange("vaccineManufacturer", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </>
            )}

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
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
              Creando...
            </>
          ) : (
            "Crear Cita"
          )}
        </Button>
      </div>
    </form>
  )
}
