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

interface Owner {
  id: string
  firstName: string
  lastName: string
  phone: string
}

interface PatientFormProps {
  owners: Owner[]
  preselectedOwnerId?: string
}

export function PatientForm({ owners, preselectedOwnerId }: PatientFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    species: "DOG" as const,
    breed: "",
    gender: "UNKNOWN" as const,
    color: "",
    birthDate: undefined as Date | undefined,
    weight: "",
    chipNumber: "",
    notes: "",
    ownerId: preselectedOwnerId || "",
  })

  const createPatient = trpc.patients.create.useMutation({
    onSuccess: () => {
      router.push("/pacientes")
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al crear el paciente")
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

    if (!formData.ownerId) {
      setError("Debes seleccionar un propietario")
      return
    }

    setIsSubmitting(true)

    createPatient.mutate({
      name: formData.name.trim(),
      species: formData.species,
      breed: formData.breed.trim() || undefined,
      gender: formData.gender,
      color: formData.color.trim() || undefined,
      birthDate: formData.birthDate,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      notes: formData.notes.trim() || undefined,
      ownerId: formData.ownerId,
    })
  }

  const handleChange = (field: string, value: string | Date | undefined) => {
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
                placeholder="Notas adicionales sobre el paciente (alergias, condiciones especiales, etc.)"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Propietario */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Propietario *</CardTitle>
          </CardHeader>
          <CardContent>
            {owners.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center">
                <p className="text-muted-foreground">
                  No hay propietarios registrados.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/propietarios/nuevo")}
                >
                  Agregar Propietario
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="owner">Selecciona el propietario</Label>
                <Select
                  value={formData.ownerId}
                  onValueChange={(value) => handleChange("ownerId", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un propietario" />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.firstName} {owner.lastName} - {owner.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
        <Button type="submit" disabled={isSubmitting || owners.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Paciente"
          )}
        </Button>
      </div>
    </form>
  )
}
