import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { UserForm } from "@/components/forms/user-form"

export default async function NuevoUsuarioPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Solo admins pueden crear usuarios
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/configuracion/equipo"
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Usuario</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo miembro al equipo de tu clínica
          </p>
        </div>
      </div>

      <UserForm />
    </div>
  )
}
