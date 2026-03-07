import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AppointmentEditForm } from "@/components/forms/appointment-edit-form"

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const appointment = await db.appointment.findFirst({
    where: {
      id,
    },
    include: {
      patient: {
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      medicalRecord: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!appointment) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/citas/${appointment.id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Cita</h1>
          <p className="text-muted-foreground">
            Modificar cita de {appointment.patient.name}
          </p>
        </div>
      </div>

      <AppointmentEditForm appointment={appointment} />
    </div>
  )
}
