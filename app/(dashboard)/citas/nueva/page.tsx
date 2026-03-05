"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AppointmentForm } from "@/components/forms/appointment-form"

function AppointmentFormWrapper() {
  return <AppointmentForm />
}

export default function NuevaCitaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/citas"
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Cita</h1>
          <p className="text-muted-foreground">
            Programa una nueva cita para un paciente
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <AppointmentFormWrapper />
      </Suspense>
    </div>
  )
}
