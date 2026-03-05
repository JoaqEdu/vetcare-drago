"use client"

import { PatientsTable } from "@/components/tables/patients-table"

export default function PacientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground">
          Gestiona los pacientes de tu clinica
        </p>
      </div>

      <PatientsTable />
    </div>
  )
}
