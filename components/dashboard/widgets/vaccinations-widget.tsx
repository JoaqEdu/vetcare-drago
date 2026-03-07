"use client"

import { trpc } from "@/lib/trpc"
import { format, isBefore, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Syringe, AlertCircle, PawPrint } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function VaccinationsWidget() {
  const { data: vaccinations, isLoading, isError } =
    trpc.dashboard.getUpcomingVaccinations.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (isError || !vaccinations) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error al cargar vacunas
      </div>
    )
  }

  if (!vaccinations || vaccinations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay vacunas pendientes próximamente
      </div>
    )
  }

  // Filter out vaccinations without patient data
  const validVaccinations = vaccinations.filter(v => v.patient && v.patient.name)

  if (validVaccinations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay vacunas pendientes próximamente
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {validVaccinations.slice(0, 5).map((vaccination) => {
        const nextDueDate = vaccination.nextDueDate
          ? new Date(vaccination.nextDueDate)
          : null
        const isOverdue = nextDueDate && isBefore(nextDueDate, new Date())
        const isDueSoon =
          nextDueDate &&
          !isOverdue &&
          isBefore(nextDueDate, addDays(new Date(), 7))

        return (
          <Link
            key={vaccination.id}
            href={`/pacientes/${vaccination.patientId}`}
            className="block p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{vaccination.patient.name}</span>
              </div>
              {isOverdue ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Vencida
                </Badge>
              ) : isDueSoon ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Próxima
                </Badge>
              ) : (
                <Badge variant="outline">Pendiente</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Syringe className="h-3 w-3" />
              <span className="font-medium">{vaccination.vaccineName}</span>
            </div>

            {nextDueDate && (
              <p className="text-sm text-muted-foreground">
                Próxima dosis:{" "}
                {format(nextDueDate, "PPP", { locale: es })}
              </p>
            )}
          </Link>
        )
      })}

      {validVaccinations.length > 5 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          +{validVaccinations.length - 5} vacunas más pendientes
        </p>
      )}
    </div>
  )
}
