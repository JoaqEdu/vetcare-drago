"use client"

import { trpc } from "@/lib/trpc"
import { PawPrint, Users, Calendar, CalendarCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsWidget() {
  const { data: stats, isLoading, isError } = trpc.reports.getMonthlySummary.useQuery({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error al cargar estadísticas
      </div>
    )
  }

  const cards = [
    {
      title: "Pacientes Nuevos",
      value: stats?.newPatients?.current || 0,
      icon: PawPrint,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Propietarios Nuevos",
      value: stats?.newOwners || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Citas Este Mes",
      value: stats?.appointments?.current || 0,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Citas Completadas",
      value: stats?.completedAppointments?.current || 0,
      icon: CalendarCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg border bg-card"
          >
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <Icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
