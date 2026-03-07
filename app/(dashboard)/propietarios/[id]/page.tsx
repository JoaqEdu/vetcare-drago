import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  PawPrint,
  Plus,
  FileText,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PortalAccessCard } from "@/components/portal/portal-access-card"

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

export default async function OwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const owner = await db.owner.findFirst({
    where: {
      id,
    },
    include: {
      patients: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  })

  if (!owner) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/propietarios"
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {owner.firstName} {owner.lastName}
            </h1>
            <p className="text-muted-foreground">
              Cliente desde {format(new Date(owner.createdAt), "MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/pacientes/nuevo?ownerId=${owner.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Mascota
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/propietarios/${owner.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Informacion de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefono</p>
                <p className="font-medium">{owner.phone}</p>
              </div>
            </div>

            {owner.alternatePhone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tel. Alternativo</p>
                  <p className="font-medium">{owner.alternatePhone}</p>
                </div>
              </div>
            )}

            {owner.email && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{owner.email}</p>
                </div>
              </div>
            )}

            {(owner.address || owner.city) && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Direccion</p>
                  <p className="font-medium">
                    {owner.address}
                    {owner.address && owner.city && ", "}
                    {owner.city}
                  </p>
                </div>
              </div>
            )}

            {owner.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{owner.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Mascotas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5" />
                  Mascotas
                </CardTitle>
                <CardDescription>
                  {owner.patients.length} mascota{owner.patients.length !== 1 ? "s" : ""} registrada{owner.patients.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/pacientes/nuevo?ownerId=${owner.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {owner.patients.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <PawPrint className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Este cliente no tiene mascotas registradas
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {owner.patients.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/pacientes/${patient.id}`}
                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <PawPrint className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {SPECIES_LABELS[patient.species]}
                        {patient.breed && ` - ${patient.breed}`}
                      </p>
                    </div>
                    <Badge variant={patient.isDeceased ? "destructive" : "outline"}>
                      {patient.isDeceased ? "Fallecido" : SPECIES_LABELS[patient.species]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen Financiero */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Total Pacientes</p>
                <p className="text-2xl font-bold">{owner.patients.length}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Citas Totales</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portal del Cliente */}
        <div className="lg:col-span-2">
          <PortalAccessCard
            ownerId={owner.id}
            ownerName={`${owner.firstName} ${owner.lastName}`}
          />
        </div>
      </div>
    </div>
  )
}
