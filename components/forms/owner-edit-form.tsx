"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"

interface Owner {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
  alternatePhone: string | null
  address: string | null
  city: string | null
  notes: string | null
}

interface OwnerEditFormProps {
  owner: Owner
}

export function OwnerEditForm({ owner }: OwnerEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    firstName: owner.firstName,
    lastName: owner.lastName,
    email: owner.email || "",
    phone: owner.phone,
    alternatePhone: owner.alternatePhone || "",
    address: owner.address || "",
    city: owner.city || "",
    notes: owner.notes || "",
  })

  const updateOwner = trpc.owners.update.useMutation({
    onSuccess: () => {
      router.push(`/propietarios/${owner.id}`)
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al actualizar el propietario")
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
      setError("El telefono es requerido")
      return
    }

    setIsSubmitting(true)

    updateOwner.mutate({
      id: owner.id,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim(),
      address: formData.address.trim() || undefined,
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informacion Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Informacion Personal</CardTitle>
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
                <Label htmlFor="phone">Telefono *</Label>
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
                <Label htmlFor="alternatePhone">Telefono Alternativo</Label>
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

        {/* Direccion */}
        <Card>
          <CardHeader>
            <CardTitle>Direccion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Direccion</Label>
              <Input
                id="address"
                placeholder="Calle, numero, colonia"
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
