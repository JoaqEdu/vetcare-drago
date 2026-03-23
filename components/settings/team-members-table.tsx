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
  KeyRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"

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
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean
    userId: string
    userName: string
  }>({ open: false, userId: "", userName: "" })
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: (_, variables) => {
      setUsers((prev) => prev.filter((u) => u.id !== variables.id))
      toast.success("Usuario eliminado exitosamente")
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar usuario")
    },
  })

  const resetPassword = trpc.users.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(`Contraseña de ${data.userName} actualizada exitosamente`)
      closeResetDialog()
    },
    onError: (error) => {
      toast.error(error.message || "Error al resetear contraseña")
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

  const openResetDialog = (userId: string, userName: string) => {
    setResetPasswordDialog({ open: true, userId, userName })
    setNewPassword("")
    setConfirmPassword("")
  }

  const closeResetDialog = () => {
    setResetPasswordDialog({ open: false, userId: "", userName: "" })
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    resetPassword.mutate({
      userId: resetPasswordDialog.userId,
      newPassword,
    })
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
                        <DropdownMenuItem
                          onClick={() => openResetDialog(user.id, user.name)}
                        >
                          <KeyRound className="mr-2 h-4 w-4" />
                          Resetear Contraseña
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

      {/* Dialog para resetear contraseña */}
      <Dialog open={resetPasswordDialog.open} onOpenChange={(open) => !open && closeResetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetear Contraseña</DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para <span className="font-semibold">{resetPasswordDialog.userName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={resetPassword.isPending}
              />
              <p className="text-sm text-muted-foreground">
                Mínimo 8 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={resetPassword.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeResetDialog}
              disabled={resetPassword.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPassword.isPending || !newPassword || !confirmPassword}
            >
              {resetPassword.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Contraseña"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
