import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DentalForm } from "@/components/forms/dental-form"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ appointmentId?: string }>
}

export default async function NewDentalPage(props: PageProps) {
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
          Nuevo Registro Dental
        </h1>
        <p className="text-muted-foreground">
          Registro de procedimiento dental para {patient.name}
        </p>
      </div>

      <DentalForm
        patient={patient}
        appointmentId={searchParams.appointmentId}
      />
    </div>
  )
}
