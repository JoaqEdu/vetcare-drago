"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  UserCircle,
  Mail,
  Phone,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  isActive: boolean
  createdAt: Date
}

interface TeamMembersTableProps {
  users: User[]
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  VET: "Veterinario",
  RECEPTIONIST: "Recepcionista",
}

const ROLE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  VET: "secondary",
  RECEPTIONIST: "outline",
}

export function TeamMembersTable({ users: initialUsers }: TeamMembersTableProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)

  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: (_, variables) => {
      setUsers((prev) => prev.filter((u) => u.id !== variables.id))
    },
  })

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`
      )
    ) {
      deleteUser.mutate({ id })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Miembros del Equipo</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <UserCircle className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay usuarios</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Agrega usuarios para comenzar a trabajar en equipo
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ROLE_COLORS[user.role]}>
                      {user.role === "ADMIN" && (
                        <Shield className="mr-1 h-3 w-3" />
                      )}
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), {
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
                          onClick={() =>
                            router.push(`/configuracion/equipo/${user.id}/editar`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={deleteUser.isPending}
                        >
                          {deleteUser.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
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

        {users.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            {users.length} usuario{users.length !== 1 ? "s" : ""} en el equipo
          </div>
        )}
      </CardContent>
    </Card>
  )
}
