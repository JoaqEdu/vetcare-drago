"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { trpc } from "@/lib/trpc"

interface OwnerFormProps {
  redirectTo?: string
}

interface PatientFormData {
  id: string
  name: string
  species: "DOG" | "CAT" | "BIRD" | "RABBIT" | "OTHER"
  breed: string
  gender: "MALE" | "FEMALE" | "UNKNOWN"
  birthDate: string
  weight: string
  color: string
  chipNumber: string
  notes: string
}

export function OwnerForm({ redirectTo = "/propietarios" }: OwnerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    notes: "",
  })

  const [patients, setPatients] = useState<PatientFormData[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      species: "DOG" as const,
      breed: "",
      gender: "UNKNOWN" as const,
      birthDate: "",
      weight: "",
      color: "",
      chipNumber: "",
      notes: "",
    },
  ])

  const createOwner = trpc.owners.create.useMutation({
    onSuccess: () => {
      router.push(redirectTo)
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al crear el propietario")
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.firstName.trim()) {
      setError("El nombre es requerido")
      return
    }

    if (!formData.lastName.trim()) {
      setError("El apellido es requerido")
      return
    }

    if (!formData.phone.trim()) {
      setError("El teléfono es requerido")
      return
    }

    // Validar que al menos haya una mascota con nombre
    const validPatients = patients.filter((p) => p.name.trim())
    if (validPatients.length === 0) {
      setError("Debes agregar al menos una mascota")
      return
    }

    setIsSubmitting(true)

    // Preparar datos de pacientes
    const patientsData = validPatients.map((p) => ({
      name: p.name.trim(),
      species: p.species,
      breed: p.breed.trim() || undefined,
      gender: p.gender,
      birthDate: p.birthDate ? new Date(p.birthDate) : undefined,
      weight: p.weight ? parseFloat(p.weight) : undefined,
      color: p.color.trim() || undefined,
      chipNumber: p.chipNumber.trim() || undefined,
      notes: p.notes.trim() || undefined,
    }))

    createOwner.mutate({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim(),
      address: formData.address.trim() || undefined,
      patients: patientsData,
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePatientChange = (id: string, field: keyof PatientFormData, value: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const addPatient = () => {
    setPatients((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        species: "DOG",
        breed: "",
        gender: "UNKNOWN",
        birthDate: "",
        weight: "",
        color: "",
        chipNumber: "",
        notes: "",
      },
    ])
  }

  const removePatient = (id: string) => {
    if (patients.length > 1) {
      setPatients((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Información del Propietario */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    placeholder="Nombre"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    placeholder="Apellido"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 555 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternatePhone">Teléfono Alternativo</Label>
                  <Input
                    id="alternatePhone"
                    type="tel"
                    placeholder="+52 555 987 6543"
                    value={formData.alternatePhone}
                    onChange={(e) => handleChange("alternatePhone", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dirección */}
          <Card>
            <CardHeader>
              <CardTitle>Dirección</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle, número, colonia"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Ciudad"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre el cliente"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mascotas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5" />
                  Mascotas
                </CardTitle>
                <CardDescription>
                  Agrega las mascotas del propietario
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPatient}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Mascota
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {patients.map((patient, index) => (
              <div key={patient.id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">
                    Mascota {index + 1}
                  </h4>
                  {patients.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePatient(patient.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`patient-name-${patient.id}`}>
                      Nombre *
                    </Label>
                    <Input
                      id={`patient-name-${patient.id}`}
                      placeholder="Nombre de la mascota"
                      value={patient.name}
                      onChange={(e) =>
                        handlePatientChange(patient.id, "name", e.target.value)
                      }
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`patient-species-${patient.id}`}>
                      Especie *
                    </Label>
                    <Select
                      value={patient.species}
                      onValueChange={(value) =>
                        handlePatientChange(patient.id, "species", value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id={`patient-species-${patient.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOG">Perro</SelectItem>
                        <SelectItem value="CAT">Gato</SelectItem>
                        <SelectItem value="BIRD">Ave</SelectItem>
                        <SelectItem value="RABBIT">Conejo</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`patient-breed-${patient.id}`}>Raza</Label>
                    <Input
                      id={`patient-breed-${patient.id}`}
                      placeholder="Raza"
                      value={patient.breed}
                      onChange={(e) =>
                        handlePatientChange(patient.id, "breed", e.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`patient-gender-${patient.id}`}>Sexo</Label>
                    <Select
                      value={patient.gender}
                      onValueChange={(value) =>
                        handlePatientChange(patient.id, "gender", value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id={`patient-gender-${patient.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Macho</SelectItem>
                        <SelectItem value="FEMALE">Hembra</SelectItem>
                        <SelectItem value="UNKNOWN">Desconocido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`patient-birthDate-${patient.id}`}>
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id={`patient-birthDate-${patient.id}`}
                      type="date"
                      value={patient.birthDate}
                      onChange={(e) =>
                        handlePatientChange(
                          patient.id,
                          "birthDate",
                          e.target.value
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`patient-weight-${patient.id}`}>
                      Peso (kg)
                    </Label>
                    <Input
                      id={`patient-weight-${patient.id}`}
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={patient.weight}
                      onChange={(e) =>
                        handlePatientChange(patient.id, "weight", e.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`patient-color-${patient.id}`}>Color</Label>
                    <Input
                      id={`patient-color-${patient.id}`}
                      placeholder="Color del pelaje"
                      value={patient.color}
                      onChange={(e) =>
                        handlePatientChange(patient.id, "color", e.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`patient-chipNumber-${patient.id}`}>
                      Número de Chip
                    </Label>
                    <Input
                      id={`patient-chipNumber-${patient.id}`}
                      placeholder="Número de microchip"
                      value={patient.chipNumber}
                      onChange={(e) =>
                        handlePatientChange(
                          patient.id,
                          "chipNumber",
                          e.target.value
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`patient-notes-${patient.id}`}>Notas</Label>
                  <Textarea
                    id={`patient-notes-${patient.id}`}
                    placeholder="Notas sobre la mascota"
                    value={patient.notes}
                    onChange={(e) =>
                      handlePatientChange(patient.id, "notes", e.target.value)
                    }
                    disabled={isSubmitting}
                    rows={2}
                  />
                </div>
              </div>
            ))}
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
            "Guardar Propietario y Mascotas"
          )}
        </Button>
      </div>
    </form>
  )
}
