"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"

interface UserFormProps {
  userId?: string
  defaultValues?: {
    name: string
    email: string
    role: string
    phone?: string
  }
}

export function UserForm({ userId, defaultValues }: UserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    password: "",
    confirmPassword: "",
    role: defaultValues?.role || "VET",
    phone: defaultValues?.phone || "",
  })

  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Usuario creado exitosamente")
      router.push("/configuracion/equipo")
      router.refresh()
    },
    onError: (error) => {
      setError(error.message || "Error al crear el usuario")
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

    if (!formData.email.trim()) {
      setError("El email es requerido")
      return
    }

    if (!userId && !formData.password) {
      setError("La contraseña es requerida")
      return
    }

    if (!userId && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!userId && formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsSubmitting(true)

    createUser.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role as "ADMIN" | "VET" | "RECEPTIONIST",
      phone: formData.phone.trim() || undefined,
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                placeholder="Dr. Juan Pérez"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@vetcare.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+52 555 123 4567"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Credenciales y Rol */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Credenciales y Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="VET">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Veterinario</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="RECEPTIONIST">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Recepcionista</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {formData.role === "ADMIN" &&
                  "Acceso completo al sistema y gestión de usuarios"}
                {formData.role === "VET" &&
                  "Puede gestionar pacientes, citas y registros médicos"}
                {formData.role === "RECEPTIONIST" &&
                  "Puede gestionar citas y propietarios"}
              </p>
            </div>

            {!userId && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Mínimo 8 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>Guardar Usuario</>
          )}
        </Button>
      </div>
    </form>
  )
}
