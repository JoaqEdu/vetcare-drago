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
  Users,
  Phone,
  Mail,
  PawPrint,
  Loader2,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"

export function OwnersTable() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const handleSearchChange = (value: string) => {
    setSearch(value)
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  const { data, isLoading, refetch } = trpc.owners.list.useQuery({
    search: debouncedSearch || undefined,
    limit: 50,
  })

  const deleteOwner = trpc.owners.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estas seguro de eliminar a ${name}? Se eliminaran tambien todas sus mascotas. Esta accion no se puede deshacer.`)) {
      deleteOwner.mutate({ id })
    }
  }

  const owners = data?.owners ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar propietarios..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild>
            <Link href="/propietarios/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Propietario
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : owners.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay propietarios</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {debouncedSearch
                ? "No se encontraron propietarios con ese criterio."
                : "Aun no has registrado ningun propietario."}
            </p>
            {!debouncedSearch && (
              <Button asChild className="mt-4">
                <Link href="/propietarios/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Propietario
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propietario</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Mascotas</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {owner.firstName.charAt(0)}{owner.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {owner.firstName} {owner.lastName}
                        </div>{/* 
                        {owner.city && (
                          <div className="text-sm text-muted-foreground">
                            {owner.city}
                          </div>
                        )} */}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {owner.phone}
                      </div>
                      {owner.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {owner.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {owner.patients.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <PawPrint className="mr-1 h-3 w-3" />
                          {owner._count.patients}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {owner.patients.slice(0, 2).map(p => p.name).join(", ")}
                          {owner.patients.length > 2 && "..."}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sin mascotas
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(owner.createdAt), {
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
                          onClick={() => router.push(`/propietarios/${owner.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/propietarios/${owner.id}/editar`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/pacientes/nuevo?ownerId=${owner.id}`)}
                        >
                          <PawPrint className="mr-2 h-4 w-4" />
                          Agregar mascota
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(owner.id, `${owner.firstName} ${owner.lastName}`)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {owners.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {owners.length} propietario{owners.length !== 1 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
