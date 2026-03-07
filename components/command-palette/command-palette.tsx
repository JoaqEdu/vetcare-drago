"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { trpc } from "@/lib/trpc"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  PawPrint,
  Users,
  Calendar,
  Plus,
  Search,
  Clock,
  Phone,
  Mail,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

const STATUS_COLORS = {
  SCHEDULED: "default",
  CONFIRMED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELED: "destructive",
  NO_SHOW: "outline",
} as const

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const { data, isLoading } = trpc.search.global.useQuery(
    { query: search, limit: 5 },
    { enabled: search.length > 0 }
  )

  const navigate = (url: string) => {
    setOpen(false)
    setSearch("")
    router.push(url)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl">
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Buscar pacientes, citas, propietarios..."
                value={search}
                onValueChange={setSearch}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                {isLoading ? "Buscando..." : "No se encontraron resultados"}
              </Command.Empty>

              {/* Acciones rápidas */}
              {!search && (
                <Command.Group heading="Acciones rápidas" className="mb-2">
                  <Command.Item
                    onSelect={() => navigate("/pacientes/nuevo")}
                    className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span>Nuevo paciente</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/citas/nueva")}
                    className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span>Nueva cita</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigate("/propietarios/nuevo")}
                    className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span>Nuevo propietario</span>
                  </Command.Item>
                </Command.Group>
              )}

              {/* Resultados de pacientes */}
              {data?.patients && data.patients.length > 0 && (
                <Command.Group heading="Pacientes" className="mb-2">
                  {data.patients.map((patient) => (
                    <Command.Item
                      key={patient.id}
                      onSelect={() => navigate(`/pacientes/${patient.id}`)}
                      className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <PawPrint className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {patient.owner.firstName} {patient.owner.lastName}
                        </div>
                      </div>
                      {patient.chipNumber && (
                        <div className="text-xs text-muted-foreground">
                          Chip: {patient.chipNumber}
                        </div>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Resultados de propietarios */}
              {data?.owners && data.owners.length > 0 && (
                <Command.Group heading="Propietarios" className="mb-2">
                  {data.owners.map((owner) => (
                    <Command.Item
                      key={owner.id}
                      onSelect={() => navigate(`/propietarios/${owner.id}`)}
                      className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                        <Users className="h-4 w-4 text-green-600 dark:text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {owner.firstName} {owner.lastName}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {owner.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {owner.phone}
                            </span>
                          )}
                          {owner.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {owner.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {owner._count.patients} {owner._count.patients === 1 ? 'paciente' : 'pacientes'}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Resultados de citas */}
              {data?.appointments && data.appointments.length > 0 && (
                <Command.Group heading="Citas" className="mb-2">
                  {data.appointments.map((apt) => (
                    <Command.Item
                      key={apt.id}
                      onSelect={() => navigate(`/citas/${apt.id}`)}
                      className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{apt.patient.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(apt.scheduledAt), "PPP", { locale: es })}
                        </div>
                      </div>
                      <Badge variant={STATUS_COLORS[apt.status]}>
                        {apt.type}
                      </Badge>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
