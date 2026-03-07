import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TeamMembersTable } from "@/components/settings/team-members-table"

export default async function EquipoPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Solo admins pueden gestionar el equipo
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await db.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/configuracion"
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipo</h1>
            <p className="text-muted-foreground">
              Gestiona los usuarios y permisos de tu clínica
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/configuracion/equipo/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Usuario
          </Link>
        </Button>
      </div>

      <TeamMembersTable users={users} />
    </div>
  )
}
