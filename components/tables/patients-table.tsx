"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  PawPrint,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Fish,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
import { ExportButton } from "@/components/tables/export-button"
import { formatPatientsForExport } from "@/lib/export-utils"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { toast } from "sonner"

const SPECIES_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  DOG: { label: "Perro", icon: Dog },
  CAT: { label: "Gato", icon: Cat },
  BIRD: { label: "Ave", icon: Bird },
  RABBIT: { label: "Conejo", icon: Rabbit },
  HAMSTER: { label: "Hamster", icon: PawPrint },
  FISH: { label: "Pez", icon: Fish },
  REPTILE: { label: "Reptil", icon: PawPrint },
  OTHER: { label: "Otro", icon: PawPrint },
}

const GENDER_LABELS: Record<string, string> = {
  MALE: "Macho",
  FEMALE: "Hembra",
  UNKNOWN: "Desconocido",
}

export function PatientsTable() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState<string>("all")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on search
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  const handleSpeciesChange = (value: string) => {
    setSpeciesFilter(value)
    setPage(1) // Reset to first page on filter change
  }

  const { data, isLoading, refetch } = trpc.patients.listPaginated.useQuery({
    search: debouncedSearch || undefined,
    species: speciesFilter !== "all" ? speciesFilter as "DOG" | "CAT" | "BIRD" | "RABBIT" | "HAMSTER" | "FISH" | "REPTILE" | "OTHER" : undefined,
    page,
    pageSize,
  })

  const deletePatient = trpc.patients.delete.useMutation({
    onSuccess: () => {
      toast.success("Paciente eliminado exitosamente")
      refetch()
    },
    onError: () => {
      toast.error("Error al eliminar paciente")
    },
  })

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) {
      deletePatient.mutate({ id })
    }
  }

  const patients = data?.patients ?? []
  const totalPages = data?.pageCount ?? 0
  const total = data?.total ?? 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={speciesFilter} onValueChange={handleSpeciesChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="DOG">Perros</SelectItem>
                <SelectItem value="CAT">Gatos</SelectItem>
                <SelectItem value="BIRD">Aves</SelectItem>
                <SelectItem value="RABBIT">Conejos</SelectItem>
                <SelectItem value="OTHER">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton
              data={patients}
              filename={`pacientes-${new Date().toISOString().split('T')[0]}`}
              formatData={formatPatientsForExport}
              disabled={isLoading}
            />
            <Button asChild>
              <Link href="/pacientes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Paciente
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={pageSize} columns={6} />
        ) : patients.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <PawPrint className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay pacientes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {debouncedSearch || speciesFilter !== "all"
                ? "No se encontraron pacientes con los filtros aplicados."
                : "Aún no has registrado ningún paciente."}
            </p>
            {!debouncedSearch && speciesFilter === "all" && (
              <Button asChild className="mt-4">
                <Link href="/pacientes/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Paciente
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const speciesInfo = SPECIES_LABELS[patient.species] || SPECIES_LABELS.OTHER
                  const SpeciesIcon = speciesInfo.icon

                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <SpeciesIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            {patient.breed && (
                              <div className="text-sm text-muted-foreground">
                                {patient.breed}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{speciesInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {patient.owner.firstName} {patient.owner.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {patient.owner.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {GENDER_LABELS[patient.gender]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(patient.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
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
                              onClick={() => router.push(`/pacientes/${patient.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/pacientes/${patient.id}/editar`)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(patient.id, patient.name)}
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, total)} de {total} paciente{total !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm">
                    Página {page} de {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
