import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PatientEditForm } from "@/components/forms/patient-edit-form"

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const patient = await db.patient.findFirst({
    where: {
      id,
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
          <h1 className="text-3xl font-bold tracking-tight">Editar Paciente</h1>
          <p className="text-muted-foreground">
            Modificar informacion de {patient.name}
          </p>
        </div>
      </div>

      <PatientEditForm patient={patient} />
    </div>
  )
}
