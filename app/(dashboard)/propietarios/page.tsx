"use client"

import { OwnersTable } from "@/components/tables/owners-table"

export default function PropietariosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Propietarios</h1>
        <p className="text-muted-foreground">
          Gestiona los clientes de tu clinica
        </p>
      </div>

      <OwnersTable />
    </div>
  )
}
