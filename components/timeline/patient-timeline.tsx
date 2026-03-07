"use client"

import { trpc } from "@/lib/trpc"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Syringe, FileText, Clock, User, ChevronRight, Bug } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const ICON_MAP = {
  appointment: Calendar,
  vaccination: Syringe,
  deworming: Bug,
  medical_record: FileText,
}

const COLOR_MAP = {
  appointment: "bg-blue-500 dark:bg-blue-600",
  vaccination: "bg-green-500 dark:bg-green-600",
  deworming: "bg-orange-500 dark:bg-orange-600",
  medical_record: "bg-purple-500 dark:bg-purple-600",
}

const STATUS_VARIANTS = {
  SCHEDULED: "default",
  CONFIRMED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELED: "destructive",
  NO_SHOW: "outline",
} as const

export function PatientTimeline({ patientId }: { patientId: string }) {
  const { data: events, isLoading } = trpc.patients.getTimeline.useQuery({
    patientId,
    limit: 100,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay eventos en el historial
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {events.map((event) => {
          const Icon = ICON_MAP[event.type]
          const color = COLOR_MAP[event.type]

          return (
            <div key={`${event.type}-${event.id}`} className="relative flex gap-4">
              {/* Icono circular */}
              <div
                className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full ${color} text-white shrink-0`}
              >
                <Icon className="h-6 w-6" />
              </div>

              {/* Card de contenido */}
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        {event.type === "appointment" && event.status && (
                          <Badge
                            variant={
                              STATUS_VARIANTS[
                                event.status as keyof typeof STATUS_VARIANTS
                              ] || "default"
                            }
                          >
                            {event.status}
                          </Badge>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.date), "PPP 'a las' p", {
                            locale: es,
                          })}
                        </div>

                        {event.vetName && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Dr. {event.vetName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Link a detalles */}
                    {getEventLink(event, patientId) && (
                      <Link
                        href={getEventLink(event, patientId)!}
                        className="ml-4 text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        Ver detalles
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getEventLink(event: any, patientId: string): string | null {
  switch (event.type) {
    case "appointment":
      return `/citas/${event.id}`
    case "medical_record":
      return `/pacientes/${patientId}/expediente/${event.id}`
    default:
      return null
  }
}
