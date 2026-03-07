import { z } from "zod"

// Regex para validar teléfono (flexible para diferentes formatos)
const phoneRegex = /^[\d\s\-\+\(\)]+$/

export const ownerSchema = z.object({
  firstName: z.string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras"),

  lastName: z.string()
    .min(1, "El apellido es requerido")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras"),

  email: z.string()
    .email("Ingresa un email válido")
    .max(100, "El email no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),

  phone: z.string()
    .min(1, "El teléfono es requerido")
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(phoneRegex, "El teléfono solo puede contener números, espacios, guiones y paréntesis"),

  address: z.string()
    .max(200, "La dirección no puede exceder 200 caracteres")
    .optional()
    .or(z.literal("")),

  city: z.string()
    .max(100, "La ciudad no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),

  notes: z.string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
})

export type OwnerFormData = z.infer<typeof ownerSchema>
