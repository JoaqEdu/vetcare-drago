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

interface LaboratoryFormProps {
  patient: Patient
  appointmentId?: string
}

const COMMON_TEST_TYPES = [
  "Hemograma Completo",
  "Bioquímica Sanguínea",
  "Urianálisis",
  "Coprologico",
  "Perfil Hepático",
  "Perfil Renal",
  "Perfil Tiroideo",
  "Serología",
]

export function LaboratoryForm({ patient, appointmentId }: LaboratoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    testType: "",
    testName: "",
    results: "",
    interpretation: "",
    laboratory: "",
    referenceValues: "",
    sampleDate: new Date(),
    resultDate: undefined as Date | undefined,
  })

  const createLabResult = trpc.laboratory.create.useMutation({
    onSuccess: () => {
      if (appointmentId) {
        router.push(`/citas/${appointmentId}`)
      } else {
        router.push(`/pacientes/${patient.id}`)
      }
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al registrar los resultados de laboratorio")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.testType.trim()) {
      setError("El tipo de análisis es requerido")
      return
    }

    if (!formData.results.trim()) {
      setError("Los resultados son requeridos")
      return
    }

    setIsSubmitting(true)

    createLabResult.mutate({
      patientId: patient.id,
      appointmentId: appointmentId || undefined,
      testType: formData.testType.trim(),
      testName: formData.testName.trim() || undefined,
      results: formData.results.trim(),
      interpretation: formData.interpretation.trim() || undefined,
      laboratory: formData.laboratory.trim() || undefined,
      referenceValues: formData.referenceValues.trim() || undefined,
      sampleDate: formData.sampleDate,
      resultDate: formData.resultDate,
    })
  }

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      {appointmentId && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30 p-4">
          <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="font-medium text-indigo-900 dark:text-indigo-100">
              Registro de resultados de laboratorio
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Estos resultados quedarán en el historial del paciente
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Análisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="testType">Tipo de Análisis *</Label>
              <Input
                id="testType"
                placeholder="Ej: Hemograma, Bioquímica..."
                value={formData.testType}
                onChange={(e) => handleChange("testType", e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_TEST_TYPES.map((test) => (
                  <Button
                    key={test}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleChange("testType", test)}
                  >
                    {test}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testName">Nombre Específico del Test</Label>
              <Input
                id="testName"
                placeholder="Ej: CBC, ALT, Creatinina..."
                value={formData.testName}
                onChange={(e) => handleChange("testName", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="laboratory">Laboratorio</Label>
              <Input
                id="laboratory"
                placeholder="Ej: Laboratorio Veterinario Central..."
                value={formData.laboratory}
                onChange={(e) => handleChange("laboratory", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Muestra *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.sampleDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.sampleDate ? (
                      format(formData.sampleDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.sampleDate}
                    onSelect={(date) => handleChange("sampleDate", date || new Date())}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Resultados</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.resultDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.resultDate ? (
                      format(formData.resultDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha (opcional)"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.resultDate}
                    onSelect={(date) => handleChange("resultDate", date)}
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
            <CardTitle>Resultados e Interpretación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="results">Resultados *</Label>
              <Textarea
                id="results"
                placeholder="Ingresa los valores obtenidos en el análisis..."
                value={formData.results}
                onChange={(e) => handleChange("results", e.target.value)}
                disabled={isSubmitting}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Ingresa los valores de cada parámetro analizado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceValues">Valores de Referencia</Label>
              <Textarea
                id="referenceValues"
                placeholder="Rangos normales para cada parámetro..."
                value={formData.referenceValues}
                onChange={(e) => handleChange("referenceValues", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interpretation">Interpretación del Veterinario</Label>
              <Textarea
                id="interpretation"
                placeholder="Análisis e interpretación de los resultados..."
                value={formData.interpretation}
                onChange={(e) => handleChange("interpretation", e.target.value)}
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
            "Registrar Resultados"
          )}
        </Button>
      </div>
    </form>
  )
}
