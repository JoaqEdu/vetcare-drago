import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { XRayForm } from "@/components/forms/xray-form"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ appointmentId?: string }>
}

export default async function NewXRayPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/")
  }

  const params = await props.params
  const searchParams = await props.searchParams

  const patient = await db.patient.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
    },
  })

  if (!patient) {
    redirect("/pacientes")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Nuevo Estudio de Rayos X
        </h1>
        <p className="text-muted-foreground">
          Registro de estudio radiográfico para {patient.name}
        </p>
      </div>

      <XRayForm
        patient={patient}
        appointmentId={searchParams.appointmentId}
      />
    </div>
  )
}
