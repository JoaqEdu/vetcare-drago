import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { OwnerEditForm } from "@/components/forms/owner-edit-form"

export default async function EditOwnerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const owner = await db.owner.findFirst({
    where: {
      id,
    },
  })

  if (!owner) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/propietarios/${owner.id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Propietario</h1>
          <p className="text-muted-foreground">
            Modificar informacion de {owner.firstName} {owner.lastName}
          </p>
        </div>
      </div>

      <OwnerEditForm owner={owner} />
    </div>
  )
}
