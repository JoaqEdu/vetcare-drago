"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function SeguridadPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsSubmitting(true)

    // Simular actualización (aquí iría el endpoint real)
    setTimeout(() => {
      toast.success("Contraseña actualizada exitosamente")
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsSubmitting(false)
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/configuracion"
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seguridad</h1>
          <p className="text-muted-foreground">
            Gestiona la seguridad de tu cuenta
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Cambiar Contraseña</CardTitle>
          </div>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={(e) => handleChange("currentPassword", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                disabled={isSubmitting}
                required
              />
              <p className="text-sm text-muted-foreground">
                Mínimo 8 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Contraseña"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              ✓
            </div>
            <div>
              <p className="font-medium">Usa una contraseña única</p>
              <p className="text-sm text-muted-foreground">
                No reutilices contraseñas de otras cuentas
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              ✓
            </div>
            <div>
              <p className="font-medium">Combina letras, números y símbolos</p>
              <p className="text-sm text-muted-foreground">
                Crea contraseñas más seguras mezclando diferentes caracteres
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              ✓
            </div>
            <div>
              <p className="font-medium">Cambia tu contraseña regularmente</p>
              <p className="text-sm text-muted-foreground">
                Actualiza tu contraseña cada 3-6 meses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
