import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { PatientForm } from "@/components/forms/patient-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NuevoPacientePage() {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect("/login")
  }

  // Obtener propietarios de la organizacion
  const owners = await db.owner.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
    orderBy: {
      firstName: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/pacientes"
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Paciente</h1>
          <p className="text-muted-foreground">
            Registra una nueva mascota en el sistema
          </p>
        </div>
      </div>

      <PatientForm owners={owners} />
    </div>
  )
}
