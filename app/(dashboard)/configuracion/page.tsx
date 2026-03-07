import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Bell, Shield, Palette } from "lucide-react"
import Link from "next/link"

export default function ConfiguracionPage() {
  const settingsSections = [
    {
      title: "Equipo",
      description: "Gestiona usuarios y permisos",
      icon: Users,
      href: "/configuracion/equipo",
    },
    {
      title: "Notificaciones",
      description: "Configura alertas y recordatorios",
      icon: Bell,
      href: "/configuracion/notificaciones",
    },
    {
      title: "Seguridad",
      description: "Contrasena y autenticacion",
      icon: Shield,
      href: "/configuracion/seguridad",
    },
    {
      title: "Apariencia",
      description: "Personaliza la interfaz",
      icon: Palette,
      href: "/configuracion/apariencia",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuracion</h1>
        <p className="text-muted-foreground">
          Gestiona las preferencias de tu cuenta y clinica
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
