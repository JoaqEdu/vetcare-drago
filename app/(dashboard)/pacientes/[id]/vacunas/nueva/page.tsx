import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { VaccinationForm } from "@/components/forms/vaccination-form"

export default async function NuevaVacunaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ appointmentId?: string }>
}) {
  const { id } = await params
  const { appointmentId } = await searchParams
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const patient = await db.patient.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      species: true,
    },
  })

  if (!patient) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/pacientes/${patient.id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Vacuna</h1>
          <p className="text-muted-foreground">
            Registrar vacunacion para {patient.name}
          </p>
        </div>
      </div>

      <VaccinationForm patient={patient} appointmentId={appointmentId} />
    </div>
  )
}
