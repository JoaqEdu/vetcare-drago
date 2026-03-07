"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FollowUpActionsProps {
  recordId: string
  patientId: string
  treatmentStatus: "ACTIVE" | "COMPLETED" | null
  requiresFollowUp: boolean
}

export function FollowUpActions({
  recordId,
  patientId,
  treatmentStatus,
  requiresFollowUp,
}: FollowUpActionsProps) {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)

  const completeTreatment = trpc.medicalRecords.completeTreatment.useMutation({
    onSuccess: () => {
      toast.success("Tratamiento concluido exitosamente")
      router.refresh()
      setIsCompleting(false)
    },
    onError: (error) => {
      toast.error(error.message || "Error al concluir tratamiento")
      setIsCompleting(false)
    },
  })

  const handleCompleteTreatment = () => {
    setIsCompleting(true)
    completeTreatment.mutate({ id: recordId })
  }

  const handleScheduleFollowUp = () => {
    // Redirigir a nueva cita con parámetros pre-poblados
    router.push(`/citas/nueva?patientId=${patientId}&parentRecordId=${recordId}&type=FOLLOWUP`)
  }

  // No mostrar nada si no requiere seguimiento o ya está completado
  if (!requiresFollowUp || treatmentStatus === "COMPLETED") {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleScheduleFollowUp}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        Programar Seguimiento
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            disabled={isCompleting}
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Concluir Tratamiento
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Concluir tratamiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el tratamiento como completado. El paciente ya no aparecerá en la lista de tratamientos activos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteTreatment}>
              Sí, concluir tratamiento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
