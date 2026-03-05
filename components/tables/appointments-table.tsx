"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Phone,
  PawPrint,
  Loader2,
  Check,
  X,
  Play,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"

const TYPE_LABELS: Record<string, string> = {
  CHECKUP: "Consulta",
  VACCINATION: "Vacunacion",
  SURGERY: "Cirugia",
  EMERGENCY: "Emergencia",
  GROOMING: "Estetica",
  DENTAL: "Dental",
  LABORATORY: "Laboratorio",
  XRAY: "Rayos X",
  FOLLOWUP: "Seguimiento",
  OTHER: "Otro",
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELED: "Cancelada",
  NO_SHOW: "No asistio",
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  SCHEDULED: "secondary",
  CONFIRMED: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELED: "destructive",
  NO_SHOW: "outline",
}

const SPECIES_LABELS: Record<string, string> = {
  DOG: "Perro",
  CAT: "Gato",
  BIRD: "Ave",
  RABBIT: "Conejo",
  HAMSTER: "Hamster",
  FISH: "Pez",
  REPTILE: "Reptil",
  OTHER: "Otro",
}

export function AppointmentsTable() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const handleSearchChange = (value: string) => {
    setSearch(value)
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  const { data, isLoading, refetch } = trpc.appointments.list.useQuery({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter as "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW" : undefined,
    type: typeFilter !== "all" ? typeFilter as "CHECKUP" | "VACCINATION" | "SURGERY" | "EMERGENCY" | "GROOMING" | "DENTAL" | "LABORATORY" | "XRAY" | "FOLLOWUP" | "OTHER" : undefined,
    limit: 50,
  })

  const updateStatus = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const deleteAppointment = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({
      id,
      status: status as "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW"
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estas seguro de eliminar esta cita? Esta accion no se puede deshacer.")) {
      deleteAppointment.mutate({ id })
    }
  }

  const appointments = data?.appointments ?? []

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isPast = (date: Date) => {
    return new Date(date) < new Date()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar citas..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="SCHEDULED">Programada</SelectItem>
                <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                <SelectItem value="IN_PROGRESS">En curso</SelectItem>
                <SelectItem value="COMPLETED">Completada</SelectItem>
                <SelectItem value="CANCELED">Cancelada</SelectItem>
                <SelectItem value="NO_SHOW">No asistio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="CHECKUP">Consulta</SelectItem>
                <SelectItem value="VACCINATION">Vacunacion</SelectItem>
                <SelectItem value="SURGERY">Cirugia</SelectItem>
                <SelectItem value="EMERGENCY">Emergencia</SelectItem>
                <SelectItem value="GROOMING">Estetica</SelectItem>
                <SelectItem value="DENTAL">Dental</SelectItem>
                <SelectItem value="LABORATORY">Laboratorio</SelectItem>
                <SelectItem value="XRAY">Rayos X</SelectItem>
                <SelectItem value="FOLLOWUP">Seguimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link href="/citas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay citas</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {debouncedSearch || statusFilter !== "all" || typeFilter !== "all"
                ? "No se encontraron citas con esos criterios."
                : "Aun no has programado ninguna cita."}
            </p>
            {!debouncedSearch && statusFilter === "all" && typeFilter === "all" && (
              <Button asChild className="mt-4">
                <Link href="/citas/nueva">
                  <Plus className="mr-2 h-4 w-4" />
                  Programar Cita
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => {
                const scheduledAt = new Date(appointment.scheduledAt)
                return (
                  <TableRow
                    key={appointment.id}
                    className={isToday(scheduledAt) ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isToday(scheduledAt)
                            ? "bg-primary text-primary-foreground"
                            : isPast(scheduledAt)
                            ? "bg-muted"
                            : "bg-primary/10"
                        }`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {format(scheduledAt, "d MMM yyyy", { locale: es })}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(scheduledAt, "HH:mm")}
                            <span className="text-xs">({appointment.duration} min)</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/pacientes/${appointment.patient.id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <PawPrint className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{appointment.patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {SPECIES_LABELS[appointment.patient.species]}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/propietarios/${appointment.patient.owner.id}`}
                        className="hover:underline"
                      >
                        <div className="font-medium">
                          {appointment.patient.owner.firstName} {appointment.patient.owner.lastName}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {appointment.patient.owner.phone}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {TYPE_LABELS[appointment.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[appointment.status]}>
                        {STATUS_LABELS[appointment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/citas/${appointment.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/citas/${appointment.id}/editar`)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {appointment.status === "SCHEDULED" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(appointment.id, "CONFIRMED")}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Confirmar
                            </DropdownMenuItem>
                          )}
                          {(appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(appointment.id, "IN_PROGRESS")}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Iniciar
                            </DropdownMenuItem>
                          )}
                          {appointment.status === "IN_PROGRESS" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(appointment.id, "COMPLETED")}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Completar
                            </DropdownMenuItem>
                          )}
                          {appointment.status !== "CANCELED" && appointment.status !== "COMPLETED" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(appointment.id, "CANCELED")}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(appointment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {appointments.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {appointments.length} cita{appointments.length !== 1 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
