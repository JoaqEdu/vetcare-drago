"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, CheckCircle } from "lucide-react"
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
}

interface XRayFormProps {
  patient: Patient
  appointmentId?: string
}

const COMMON_BODY_PARTS = [
  "Tórax",
  "Abdomen",
  "Columna Vertebral",
  "Pelvis",
  "Extremidades Anteriores",
  "Extremidades Posteriores",
  "Cráneo",
  "Dentadura",
]

const COMMON_VIEWS = [
  "Lateral",
  "Ventrodorsal (VD)",
  "Dorsoventral (DV)",
  "Lateral Derecha",
  "Lateral Izquierda",
  "Oblicua",
]

export function XRayForm({ patient, appointmentId }: XRayFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    bodyPart: "",
    views: "",
    findings: "",
    diagnosis: "",
    imageUrl: "",
    notes: "",
    performedAt: new Date(),
  })

  const createXRay = trpc.xray.create.useMutation({
    onSuccess: () => {
      if (appointmentId) {
        router.push(`/citas/${appointmentId}`)
      } else {
        router.push(`/pacientes/${patient.id}`)
      }
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al registrar los rayos X")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.bodyPart.trim()) {
      setError("La parte del cuerpo es requerida")
      return
    }

    if (!formData.findings.trim()) {
      setError("Los hallazgos son requeridos")
      return
    }

    setIsSubmitting(true)

    createXRay.mutate({
      patientId: patient.id,
      appointmentId: appointmentId || undefined,
      bodyPart: formData.bodyPart.trim(),
      views: formData.views.trim() || undefined,
      findings: formData.findings.trim(),
      diagnosis: formData.diagnosis.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      performedAt: formData.performedAt,
    })
  }

  const handleChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      {appointmentId && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 p-4">
          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <div>
            <p className="font-medium text-purple-900 dark:text-purple-100">
              Registro de rayos X desde cita completada
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Este estudio quedará registrado en el historial del paciente
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Estudio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bodyPart">Parte del Cuerpo *</Label>
              <Input
                id="bodyPart"
                placeholder="Ej: Tórax, Abdomen, Extremidades..."
                value={formData.bodyPart}
                onChange={(e) => handleChange("bodyPart", e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_BODY_PARTS.map((part) => (
                  <Button
                    key={part}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleChange("bodyPart", part)}
                  >
                    {part}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="views">Vistas / Proyecciones</Label>
              <Input
                id="views"
                placeholder="Ej: Lateral, VD, DV..."
                value={formData.views}
                onChange={(e) => handleChange("views", e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_VIEWS.map((view) => (
                  <Button
                    key={view}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleChange("views", view)}
                  >
                    {view}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de Imagen (opcional)</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                URL de la imagen digital del estudio radiográfico
              </p>
            </div>

            <div className="space-y-2">
              <Label>Fecha del Estudio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.performedAt && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.performedAt ? (
                      format(formData.performedAt, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.performedAt}
                    onSelect={(date) => handleChange("performedAt", date || new Date())}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hallazgos y Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="findings">Hallazgos Radiográficos *</Label>
              <Textarea
                id="findings"
                placeholder="Describe los hallazgos observados en el estudio radiográfico..."
                value={formData.findings}
                onChange={(e) => handleChange("findings", e.target.value)}
                disabled={isSubmitting}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Descripción detallada de lo observado en las imágenes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico Radiológico</Label>
              <Textarea
                id="diagnosis"
                placeholder="Interpretación y diagnóstico basado en los hallazgos..."
                value={formData.diagnosis}
                onChange={(e) => handleChange("diagnosis", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones, recomendaciones, estudios complementarios..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                disabled={isSubmitting}
                rows={4}
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
            "Registrar Rayos X"
          )}
        </Button>
      </div>
    </form>
  )
}
