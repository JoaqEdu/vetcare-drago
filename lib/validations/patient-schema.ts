import { z } from "zod"
import { Species, Gender } from "@prisma/client"

export const patientSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras"),

  species: z.nativeEnum(Species, {
    errorMap: () => ({ message: "Selecciona una especie válida" })
  }),

  breed: z.string()
    .max(50, "La raza no puede exceder 50 caracteres")
    .optional()
    .or(z.literal("")),

  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Selecciona un género válido" })
  }),

  birthDate: z.date({
    required_error: "La fecha de nacimiento es requerida",
    invalid_type_error: "Ingresa una fecha válida",
  })
    .max(new Date(), "La fecha de nacimiento no puede ser en el futuro")
    .optional()
    .nullable(),

  weight: z.number({
    invalid_type_error: "El peso debe ser un número",
  })
    .min(0.1, "El peso debe ser mayor a 0")
    .max(1000, "El peso no puede exceder 1000 kg")
    .optional()
    .nullable(),

  color: z.string()
    .max(30, "El color no puede exceder 30 caracteres")
    .optional()
    .or(z.literal("")),

  chipNumber: z.string()
    .max(20, "El número de chip no puede exceder 20 caracteres")
    .regex(/^[0-9A-Za-z]*$/, "El chip solo puede contener números y letras")
    .optional()
    .or(z.literal("")),

  notes: z.string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),

  ownerId: z.string()
    .min(1, "Debes seleccionar un propietario"),
})

export type PatientFormData = z.infer<typeof patientSchema>
