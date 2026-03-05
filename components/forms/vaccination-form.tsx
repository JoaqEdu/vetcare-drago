"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc"

interface Patient {
  id: string
  name: string
  species: string
}

interface VaccinationFormProps {
  patient: Patient
}

const COMMON_VACCINES: Record<string, string[]> = {
  DOG: ["Rabia", "Parvovirus", "Moquillo", "Hepatitis", "Leptospirosis", "Bordetella"],
  CAT: ["Rabia", "Triple Felina", "Leucemia Felina", "PIF"],
  default: ["Rabia"],
}

export function VaccinationForm({ patient }: VaccinationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    vaccineName: "",
    vaccineType: "",
    manufacturer: "",
    batchNumber: "",
    administeredAt: new Date(),
    nextDueDate: undefined as Date | undefined,
    notes: "",
  })

  const createVaccination = trpc.vaccinations.create.useMutation({
    onSuccess: () => {
      router.push(`/pacientes/${patient.id}`)
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al registrar la vacuna")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.vaccineName.trim()) {
      setError("El nombre de la vacuna es requerido")
      return
    }

    setIsSubmitting(true)

    createVaccination.mutate({
      patientId: patient.id,
      vaccineName: formData.vaccineName.trim(),
      vaccineType: formData.vaccineType.trim() || undefined,
      manufacturer: formData.manufacturer.trim() || undefined,
      batchNumber: formData.batchNumber.trim() || undefined,
      administeredAt: formData.administeredAt,
      nextDueDate: formData.nextDueDate,
      notes: formData.notes.trim() || undefined,
    })
  }

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const suggestedVaccines = COMMON_VACCINES[patient.species] || COMMON_VACCINES.default

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informacion de la Vacuna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="vaccineName">Nombre de la Vacuna *</Label>
              <Input
                id="vaccineName"
                placeholder="Ej: Rabia, Parvovirus..."
                value={formData.vaccineName}
                onChange={(e) => handleChange("vaccineName", e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex flex-wrap gap-1">
                {suggestedVaccines.map((vaccine) => (
                  <Button
                    key={vaccine}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleChange("vaccineName", vaccine)}
                  >
                    {vaccine}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccineType">Tipo de Vacuna</Label>
              <Input
                id="vaccineType"
                placeholder="Ej: Inactivada, Atenuada..."
                value={formData.vaccineType}
                onChange={(e) => handleChange("vaccineType", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Laboratorio</Label>
                <Input
                  id="manufacturer"
                  placeholder="Ej: Zoetis, MSD..."
                  value={formData.manufacturer}
                  onChange={(e) => handleChange("manufacturer", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Numero de Lote</Label>
                <Input
                  id="batchNumber"
                  placeholder="Ej: ABC123"
                  value={formData.batchNumber}
                  onChange={(e) => handleChange("batchNumber", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fechas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha de Aplicacion *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.administeredAt && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.administeredAt ? (
                      format(formData.administeredAt, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.administeredAt}
                    onSelect={(date) => handleChange("administeredAt", date || new Date())}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Proxima Dosis</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.nextDueDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.nextDueDate ? (
                      format(formData.nextDueDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha (opcional)"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.nextDueDate}
                    onSelect={(date) => handleChange("nextDueDate", date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const date = new Date()
                    date.setMonth(date.getMonth() + 1)
                    handleChange("nextDueDate", date)
                  }}
                >
                  +1 mes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const date = new Date()
                    date.setFullYear(date.getFullYear() + 1)
                    handleChange("nextDueDate", date)
                  }}
                >
                  +1 ano
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones adicionales..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

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
            "Registrar Vacuna"
          )}
        </Button>
      </div>
    </form>
  )
}
