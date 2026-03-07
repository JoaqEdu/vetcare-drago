"use client"

import { trpc } from "@/lib/trpc"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

const STATUS_COLORS = {
  SCHEDULED: "default",
  CONFIRMED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELED: "destructive",
  NO_SHOW: "outline",
} as const

export function AppointmentsWidget() {
  const { data: appointments, isLoading, isError } = trpc.appointments.list.useQuery({
    cursor: undefined,
    limit: 5,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (isError || !appointments) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error al cargar citas
      </div>
    )
  }

  if (!appointments?.items || appointments.items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay citas programadas próximamente
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {appointments.items.slice(0, 5).map((appointment) => (
        <Link
          key={appointment.id}
          href={`/citas/${appointment.id}`}
          className="block p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{appointment.patient.name}</span>
            </div>
            <Badge variant={STATUS_COLORS[appointment.status]}>
              {appointment.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(appointment.scheduledAt), "PPP 'a las' p", {
                locale: es,
              })}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Dr. {appointment.vet.name}
            </div>
          </div>

          {appointment.reason && (
            <p className="text-sm mt-2 text-muted-foreground line-clamp-1">
              {appointment.reason}
            </p>
          )}
        </Link>
      ))}

      {appointments.items.length > 5 && (
        <Link
          href="/citas"
          className="block text-center text-sm text-primary hover:underline mt-4"
        >
          Ver todas las citas ({appointments.items.length})
        </Link>
      )}
    </div>
  )
}
