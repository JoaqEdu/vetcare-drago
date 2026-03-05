"use client"

import { AppointmentsTable } from "@/components/tables/appointments-table"

export default function CitasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Citas</h1>
        <p className="text-muted-foreground">
          Gestiona las citas de tu clinica
        </p>
      </div>

      <AppointmentsTable />
    </div>
  )
}
