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
import { Checkbox } from "@/components/ui/checkbox"
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

interface DentalFormProps {
  patient: Patient
  appointmentId?: string
}

const COMMON_PROCEDURES = [
  "Limpieza Dental",
  "Extracción",
  "Tratamiento de Caries",
  "Tratamiento Periodontal",
  "Evaluación Dental",
]

export function DentalForm({ patient, appointmentId }: DentalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    procedure: "",
    teethAffected: "",
    findings: "",
    treatment: "",
    anesthesia: false,
    nextCheckup: undefined as Date | undefined,
    notes: "",
    performedAt: new Date(),
  })

  const createDental = trpc.dental.create.useMutation({
    onSuccess: () => {
      if (appointmentId) {
        router.push(`/citas/${appointmentId}`)
      } else {
        router.push(`/pacientes/${patient.id}`)
      }
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al registrar el procedimiento dental")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.procedure.trim()) {
      setError("El procedimiento es requerido")
      return
    }

    setIsSubmitting(true)

    createDental.mutate({
      patientId: patient.id,
      appointmentId: appointmentId || undefined,
      procedure: formData.procedure.trim(),
      teethAffected: formData.teethAffected.trim() || undefined,
      findings: formData.findings.trim() || undefined,
      treatment: formData.treatment.trim() || undefined,
      anesthesia: formData.anesthesia,
      nextCheckup: formData.nextCheckup,
      notes: formData.notes.trim() || undefined,
      performedAt: formData.performedAt,
    })
  }

  const handleChange = (field: string, value: string | Date | undefined | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      {appointmentId && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-950/30 p-4">
          <CheckCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <div>
            <p className="font-medium text-cyan-900 dark:text-cyan-100">
              Registro dental desde cita completada
            </p>
            <p className="text-sm text-cyan-700 dark:text-cyan-300">
              Este procedimiento quedará registrado en el historial del paciente
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Procedimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="procedure">Procedimiento *</Label>
              <Input
                id="procedure"
                placeholder="Ej: Limpieza Dental, Extracción..."
                value={formData.procedure}
                onChange={(e) => handleChange("procedure", e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_PROCEDURES.map((proc) => (
                  <Button
                    key={proc}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleChange("procedure", proc)}
                  >
                    {proc}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teethAffected">Dientes Afectados</Label>
              <Input
                id="teethAffected"
                placeholder="Ej: Canino superior izquierdo, Premolares 3 y 4..."
                value={formData.teethAffected}
                onChange={(e) => handleChange("teethAffected", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="findings">Hallazgos</Label>
              <Textarea
                id="findings"
                placeholder="Describe los hallazgos durante el procedimiento..."
                value={formData.findings}
                onChange={(e) => handleChange("findings", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Tratamiento Realizado</Label>
              <Textarea
                id="treatment"
                placeholder="Describe el tratamiento aplicado..."
                value={formData.treatment}
                onChange={(e) => handleChange("treatment", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="anesthesia"
                checked={formData.anesthesia}
                onCheckedChange={(checked) => handleChange("anesthesia", checked === true)}
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <Label
                  htmlFor="anesthesia"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Se utilizó anestesia
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Marca esto si el procedimiento requirió anestesia general o local
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fechas y Seguimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha del Procedimiento *</Label>
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

            <div className="space-y-2">
              <Label>Próximo Chequeo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.nextCheckup && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.nextCheckup ? (
                      format(formData.nextCheckup, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha (opcional)"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.nextCheckup}
                    onSelect={(date) => handleChange("nextCheckup", date)}
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
                    date.setMonth(date.getMonth() + 6)
                    handleChange("nextCheckup", date)
                  }}
                >
                  +6 meses
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const date = new Date()
                    date.setFullYear(date.getFullYear() + 1)
                    handleChange("nextCheckup", date)
                  }}
                >
                  +1 año
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones, recomendaciones post-procedimiento..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                disabled={isSubmitting}
                rows={6}
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
            "Registrar Procedimiento"
          )}
        </Button>
      </div>
    </form>
  )
}
