"use client"

import { GripVertical } from "lucide-react"
import { DashboardWidgets } from "./dashboard-widgets"

interface DashboardContentProps {
  userName: string
}

export function DashboardContent({ userName }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido, {userName}
          </h1>
          <p className="text-muted-foreground">
            Resumen general de tu clínica veterinaria.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GripVertical className="h-4 w-4" />
          <span>Arrastra para reordenar</span>
        </div>
      </div>

      {/* Drag & Drop Widgets */}
      <DashboardWidgets />
    </div>
  )
}