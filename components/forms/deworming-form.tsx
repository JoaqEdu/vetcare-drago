"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, CheckCircle, Info } from "lucide-react"
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
  weight?: number | null
}

interface DewormingFormProps {
  patient: Patient
  appointmentId?: string
}

const COMMON_DEWORMERS: Record<string, string[]> = {
  DOG: ["Drontal Plus", "Milbemax", "Panacur", "Heartgard Plus", "NexGard Spectra"],
  CAT: ["Milbemax", "Drontal", "Profender", "Revolution Plus"],
  default: ["Drontal", "Milbemax", "Panacur"],
}

const DEWORMER_TYPES = [
  "Interno",
  "Externo",
  "Interno y Externo",
]

export function DewormingForm({ patient, appointmentId }: DewormingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    productName: "",
    productType: "",
    manufacturer: "",
    dose: "",
    weight: patient.weight || undefined,
    administeredAt: new Date(),
    nextDueDate: undefined as Date | undefined,
    nextDewormingType: "",
    notes: "",
  })

  const createDeworming = trpc.dewormings.create.useMutation({
    onSuccess: () => {
      // Si viene de una cita, redirigir a la cita
      if (appointmentId) {
        router.push(`/citas/${appointmentId}`)
      } else {
        router.push(`/pacientes/${patient.id}`)
      }
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al registrar la desparasitación")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.productName.trim()) {
      setError("El nombre del producto es requerido")
      return
    }

    setIsSubmitting(true)

    createDeworming.mutate({
      patientId: patient.id,
      appointmentId: appointmentId || undefined,
      productName: formData.productName.trim(),
      productType: formData.productType.trim() || undefined,
      manufacturer: formData.manufacturer.trim() || undefined,
      dose: formData.dose.trim() || undefined,
      weight: formData.weight,
      administeredAt: formData.administeredAt,
      nextDueDate: formData.nextDueDate,
      nextDewormingType: formData.nextDewormingType.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    })
  }

  const handleChange = (field: string, value: string | Date | undefined | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const suggestedProducts = COMMON_DEWORMERS[patient.species] || COMMON_DEWORMERS.default

  return (
    <form onSubmit={handleSubmit}>
      {appointmentId && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-4">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              Registro de desparasitación desde cita completada
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Este registro quedará en el historial del paciente
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="productName">Nombre del Producto *</Label>
              <Input
                id="productName"
                placeholder="Ej: Drontal Plus, Milbemax..."
                value={formData.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex flex-wrap gap-1">
                {suggestedProducts.map((product) => (
                  <Button
                    key={product}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleChange("productName", product)}
                  >
                    {product}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">Tipo de Desparasitante</Label>
              <div className="flex flex-wrap gap-2">
                {DEWORMER_TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.productType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("productType", type)}
                    disabled={isSubmitting}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Laboratorio</Label>
                <Input
                  id="manufacturer"
                  placeholder="Ej: Bayer, Elanco..."
                  value={formData.manufacturer}
                  onChange={(e) => handleChange("manufacturer", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dose">Dosis Aplicada</Label>
                <Input
                  id="dose"
                  placeholder="Ej: 5ml, 1 tableta..."
                  value={formData.dose}
                  onChange={(e) => handleChange("dose", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso Actual (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                placeholder="Peso del paciente"
                value={formData.weight || ""}
                onChange={(e) => handleChange("weight", e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                El peso al momento de la desparasitación ayuda a ajustar futuras dosis
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fechas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha de Aplicación *</Label>
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
              <Label>Próxima Desparasitación</Label>
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
                    date.setMonth(date.getMonth() + 3)
                    handleChange("nextDueDate", date)
                  }}
                >
                  +3 meses
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const date = new Date()
                    date.setMonth(date.getMonth() + 6)
                    handleChange("nextDueDate", date)
                  }}
                >
                  +6 meses
                </Button>
              </div>
            </div>

            {/* Información sobre próxima desparasitación */}
            {formData.nextDueDate && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm flex-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Próxima desparasitación programada
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Se creará automáticamente una cita de recordatorio
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextDewormingType">Tipo de Próxima Desparasitación</Label>
                  <Input
                    id="nextDewormingType"
                    placeholder="Ej: Interno, Externo, Interno y Externo..."
                    value={formData.nextDewormingType}
                    onChange={(e) => handleChange("nextDewormingType", e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional: especifica el tipo de desparasitación que toca
                  </p>
                </div>
              </div>
            )}

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
            "Registrar Desparasitación"
          )}
        </Button>
      </div>
    </form>
  )
}
