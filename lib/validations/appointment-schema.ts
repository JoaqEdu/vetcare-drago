import { z } from "zod"

// Enums definidos manualmente para evitar importar @prisma/client en el navegador
const AppointmentType = {
  CHECKUP: "CHECKUP",
  VACCINATION: "VACCINATION",
  DEWORMING: "DEWORMING",
  SURGERY: "SURGERY",
  EMERGENCY: "EMERGENCY",
  GROOMING: "GROOMING",
  DENTAL: "DENTAL",
  LABORATORY: "LABORATORY",
  XRAY: "XRAY",
  FOLLOWUP: "FOLLOWUP",
  OTHER: "OTHER",
} as const

const AppointmentStatus = {
  SCHEDULED: "SCHEDULED",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
  NO_SHOW: "NO_SHOW",
} as const

export const appointmentSchema = z.object({
  patientId: z.string()
    .min(1, "Debes seleccionar un paciente"),

  vetId: z.string()
    .min(1, "Debes seleccionar un veterinario"),

  type: z.nativeEnum(AppointmentType, {
    errorMap: () => ({ message: "Selecciona un tipo de cita válido" })
  }),

  scheduledAt: z.date({
    required_error: "La fecha y hora son requeridas",
    invalid_type_error: "Ingresa una fecha válida",
  })
    .refine(
      (date) => date > new Date(),
      "La fecha debe ser en el futuro"
    ),

  duration: z.number({
    required_error: "La duración es requerida",
    invalid_type_error: "La duración debe ser un número",
  })
    .int("La duración debe ser un número entero")
    .min(15, "La duración mínima es 15 minutos")
    .max(480, "La duración máxima es 8 horas (480 minutos)")
    .default(30),

  status: z.nativeEnum(AppointmentStatus, {
    errorMap: () => ({ message: "Selecciona un estado válido" })
  })
    .default("SCHEDULED"),

  reason: z.string()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .max(200, "El motivo no puede exceder 200 caracteres")
    .optional()
    .or(z.literal("")),

  notes: z.string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

// Schema para editar citas (permite fechas pasadas)
export const appointmentEditSchema = appointmentSchema.extend({
  scheduledAt: z.date({
    required_error: "La fecha y hora son requeridas",
    invalid_type_error: "Ingresa una fecha válida",
  }),
})

export type AppointmentEditFormData = z.infer<typeof appointmentEditSchema>
