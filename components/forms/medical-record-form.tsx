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
  weight: number | null
}

interface MedicalRecordFormProps {
  patient: Patient
  appointmentId?: string
}

export function MedicalRecordForm({ patient, appointmentId }: MedicalRecordFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    chiefComplaint: "",
    presentIllness: "",
    weight: patient.weight?.toString() || "",
    temperature: "",
    heartRate: "",
    respiratoryRate: "",
    diagnosis: "",
    differentialDx: "",
    prognosis: "",
    treatment: "",
    recommendations: "",
    followUpDate: undefined as Date | undefined,
    internalNotes: "",
  })

  const createRecord = trpc.medicalRecords.create.useMutation({
    onSuccess: () => {
      router.push(`/pacientes/${patient.id}`)
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al crear el expediente")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    createRecord.mutate({
      patientId: patient.id,
      appointmentId: appointmentId || undefined,
      chiefComplaint: formData.chiefComplaint || undefined,
      presentIllness: formData.presentIllness || undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
      respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
      diagnosis: formData.diagnosis || undefined,
      differentialDx: formData.differentialDx || undefined,
      prognosis: formData.prognosis || undefined,
      treatment: formData.treatment || undefined,
      recommendations: formData.recommendations || undefined,
      followUpDate: formData.followUpDate,
      internalNotes: formData.internalNotes || undefined,
    })
  }

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Motivo y Anamnesis */}
        <Card>
          <CardHeader>
            <CardTitle>Motivo de Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Motivo Principal</Label>
              <Textarea
                id="chiefComplaint"
                placeholder="Motivo por el que el paciente es traido a consulta..."
                value={formData.chiefComplaint}
                onChange={(e) => handleChange("chiefComplaint", e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentIllness">Historia de la Enfermedad Actual</Label>
              <Textarea
                id="presentIllness"
                placeholder="Evolucion de los sintomas, duracion, tratamientos previos..."
                value={formData.presentIllness}
                onChange={(e) => handleChange("presentIllness", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Signos Vitales */}
        <Card>
          <CardHeader>
            <CardTitle>Examen Fisico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 5.5"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 38.5"
                  value={formData.temperature}
                  onChange={(e) => handleChange("temperature", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heartRate">Frec. Cardiaca (lpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  placeholder="Ej: 120"
                  value={formData.heartRate}
                  onChange={(e) => handleChange("heartRate", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="respiratoryRate">Frec. Respiratoria (rpm)</Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  placeholder="Ej: 20"
                  value={formData.respiratoryRate}
                  onChange={(e) => handleChange("respiratoryRate", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostico */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnostico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnostico</Label>
              <Textarea
                id="diagnosis"
                placeholder="Diagnostico principal..."
                value={formData.diagnosis}
                onChange={(e) => handleChange("diagnosis", e.target.value)}
                disabled={isSubmitting}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="differentialDx">Diagnosticos Diferenciales</Label>
              <Textarea
                id="differentialDx"
                placeholder="Otros diagnosticos posibles..."
                value={formData.differentialDx}
                onChange={(e) => handleChange("differentialDx", e.target.value)}
                disabled={isSubmitting}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prognosis">Pronostico</Label>
              <Input
                id="prognosis"
                placeholder="Ej: Favorable, Reservado, Grave..."
                value={formData.prognosis}
                onChange={(e) => handleChange("prognosis", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tratamiento */}
        <Card>
          <CardHeader>
            <CardTitle>Plan de Tratamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="treatment">Tratamiento</Label>
              <Textarea
                id="treatment"
                placeholder="Medicamentos, dosis, duracion..."
                value={formData.treatment}
                onChange={(e) => handleChange("treatment", e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recomendaciones</Label>
              <Textarea
                id="recommendations"
                placeholder="Indicaciones para el propietario..."
                value={formData.recommendations}
                onChange={(e) => handleChange("recommendations", e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Seguimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.followUpDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.followUpDate ? (
                      format(formData.followUpDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.followUpDate}
                    onSelect={(date) => handleChange("followUpDate", date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalNotes">Notas Internas</Label>
              <Textarea
                id="internalNotes"
                placeholder="Notas privadas (no visibles para el cliente)..."
                value={formData.internalNotes}
                onChange={(e) => handleChange("internalNotes", e.target.value)}
                disabled={isSubmitting}
                rows={2}
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
            "Guardar Expediente"
          )}
        </Button>
      </div>
    </form>
  )
}
