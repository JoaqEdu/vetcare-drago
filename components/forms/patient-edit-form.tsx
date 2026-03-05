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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc"

const SPECIES_OPTIONS = [
  { value: "DOG", label: "Perro" },
  { value: "CAT", label: "Gato" },
  { value: "BIRD", label: "Ave" },
  { value: "RABBIT", label: "Conejo" },
  { value: "HAMSTER", label: "Hamster" },
  { value: "FISH", label: "Pez" },
  { value: "REPTILE", label: "Reptil" },
  { value: "OTHER", label: "Otro" },
] as const

const GENDER_OPTIONS = [
  { value: "MALE", label: "Macho" },
  { value: "FEMALE", label: "Hembra" },
  { value: "UNKNOWN", label: "Desconocido" },
] as const

interface Patient {
  id: string
  name: string
  species: string
  breed: string | null
  gender: string
  color: string | null
  birthDate: Date | null
  weight: number | null
  chipNumber: string | null
  notes: string | null
  isActive: boolean
  isDeceased: boolean
}

interface PatientEditFormProps {
  patient: Patient
}

export function PatientEditForm({ patient }: PatientEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: patient.name,
    species: patient.species as typeof SPECIES_OPTIONS[number]["value"],
    breed: patient.breed || "",
    gender: patient.gender as typeof GENDER_OPTIONS[number]["value"],
    color: patient.color || "",
    birthDate: patient.birthDate ? new Date(patient.birthDate) : undefined,
    weight: patient.weight?.toString() || "",
    chipNumber: patient.chipNumber || "",
    notes: patient.notes || "",
    isActive: patient.isActive,
    isDeceased: patient.isDeceased,
  })

  const updatePatient = trpc.patients.update.useMutation({
    onSuccess: () => {
      router.push(`/pacientes/${patient.id}`)
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al actualizar el paciente")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) {
      setError("El nombre es requerido")
      return
    }

    setIsSubmitting(true)

    updatePatient.mutate({
      id: patient.id,
      name: formData.name.trim(),
      species: formData.species,
      breed: formData.breed.trim() || undefined,
      gender: formData.gender,
      color: formData.color.trim() || undefined,
      birthDate: formData.birthDate,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      notes: formData.notes.trim() || undefined,
      isActive: formData.isActive,
      isDeceased: formData.isDeceased,
    })
  }

  const handleChange = (field: string, value: string | Date | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informacion Basica */}
        <Card>
          <CardHeader>
            <CardTitle>Informacion Basica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Nombre de la mascota"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="species">Especie *</Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => handleChange("species", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona especie" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIES_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Raza</Label>
                <Input
                  id="breed"
                  placeholder="Ej: Labrador, Siames..."
                  value={formData.breed}
                  onChange={(e) => handleChange("breed", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Genero</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona genero" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="Ej: Negro, Blanco..."
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informacion Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Informacion Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.birthDate && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birthDate ? (
                        format(formData.birthDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.birthDate}
                      onSelect={(date) => handleChange("birthDate", date)}
                      disabled={(date) => date > new Date()}
                      defaultMonth={formData.birthDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ej: 5.5"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chipNumber">Numero de Chip</Label>
              <Input
                id="chipNumber"
                placeholder="Numero de microchip"
                value={formData.chipNumber}
                onChange={(e) => handleChange("chipNumber", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionales sobre el paciente"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="isActive">Estado</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) => handleChange("isActive", value === "active")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isDeceased">Fallecido</Label>
                <Select
                  value={formData.isDeceased ? "yes" : "no"}
                  onValueChange={(value) => handleChange("isDeceased", value === "yes")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Si</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
