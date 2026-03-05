import { OwnerForm } from "@/components/forms/owner-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NuevoPropietarioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/propietarios"
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Propietario</h1>
          <p className="text-muted-foreground">
            Registra un nuevo cliente en el sistema
          </p>
        </div>
      </div>

      <OwnerForm />
    </div>
  )
}
