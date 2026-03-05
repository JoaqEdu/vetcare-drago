import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MedicalRecordForm } from "@/components/forms/medical-record-form"

export default async function NuevoExpedientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ appointmentId?: string }>
}) {
  const { id } = await params
  const { appointmentId } = await searchParams
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect("/login")
  }

  const patient = await db.patient.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      name: true,
      species: true,
      weight: true,
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
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Expediente</h1>
          <p className="text-muted-foreground">
            Crear expediente medico para {patient.name}
          </p>
        </div>
      </div>

      <MedicalRecordForm patient={patient} appointmentId={appointmentId} />
    </div>
  )
}
