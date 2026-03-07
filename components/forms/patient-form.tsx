"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc"
import { patientSchema, type PatientFormData } from "@/lib/validations/patient-schema"
import { toast } from "sonner"
import { Species, Gender } from "@prisma/client"

const SPECIES_OPTIONS = [
  { value: "DOG" as Species, label: "Perro" },
  { value: "CAT" as Species, label: "Gato" },
  { value: "BIRD" as Species, label: "Ave" },
  { value: "RABBIT" as Species, label: "Conejo" },
  { value: "HAMSTER" as Species, label: "Hamster" },
  { value: "FISH" as Species, label: "Pez" },
  { value: "REPTILE" as Species, label: "Reptil" },
  { value: "OTHER" as Species, label: "Otro" },
]

const GENDER_OPTIONS = [
  { value: "MALE" as Gender, label: "Macho" },
  { value: "FEMALE" as Gender, label: "Hembra" },
  { value: "UNKNOWN" as Gender, label: "Desconocido" },
]

interface Owner {
  id: string
  firstName: string
  lastName: string
  phone: string
}

interface PatientFormProps {
  owners: Owner[]
  preselectedOwnerId?: string
  defaultValues?: Partial<PatientFormData>
  patientId?: string
}

export function PatientForm({
  owners,
  preselectedOwnerId,
  defaultValues,
  patientId
}: PatientFormProps) {
  const router = useRouter()

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      species: defaultValues?.species || "DOG",
      breed: defaultValues?.breed || "",
      gender: defaultValues?.gender || "UNKNOWN",
      birthDate: defaultValues?.birthDate || null,
      weight: defaultValues?.weight || null,
      color: defaultValues?.color || "",
      chipNumber: defaultValues?.chipNumber || "",
      notes: defaultValues?.notes || "",
      ownerId: preselectedOwnerId || defaultValues?.ownerId || "",
    },
    mode: "onChange", // Validación en tiempo real
  })

  const createPatient = trpc.patients.create.useMutation({
    onSuccess: () => {
      toast.success("Paciente creado exitosamente")
      router.push("/pacientes")
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el paciente")
    },
  })

  const updatePatient = trpc.patients.update.useMutation({
    onSuccess: () => {
      toast.success("Paciente actualizado exitosamente")
      router.push(`/pacientes/${patientId}`)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el paciente")
    },
  })

  const onSubmit = (data: PatientFormData) => {
    if (patientId) {
      updatePatient.mutate({ id: patientId, ...data })
    } else {
      createPatient.mutate(data)
    }
  }

  const isSubmitting = createPatient.isPending || updatePatient.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Max, Luna, Rocky..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Especie */}
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especie *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una especie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPECIES_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Raza */}
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raza</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Labrador, Persa, etc."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Género */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha de Nacimiento */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Peso */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ej: 5.5"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseFloat(value) : null)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Color */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Marrón, Blanco, etc."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número de Chip */}
              <FormField
                control={form.control}
                name="chipNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Chip</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 123456789ABCD"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Número de microchip de identificación
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Propietario */}
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propietario *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un propietario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {owners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.firstName} {owner.lastName} - {owner.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional sobre el paciente..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Alergias, comportamiento, preferencias, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {patientId ? "Actualizar" : "Crear"} Paciente
          </Button>
        </div>
      </form>
    </Form>
  )
}
