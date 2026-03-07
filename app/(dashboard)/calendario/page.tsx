import { AppointmentsCalendar } from "@/components/calendar/appointments-calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, List, Plus } from "lucide-react"
import Link from "next/link"

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario de Citas</h1>
          <p className="text-muted-foreground">
            Vista interactiva de todas las citas programadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/citas">
              <List className="mr-2 h-4 w-4" />
              Vista Lista
            </Link>
          </Button>
          <Button asChild>
            <Link href="/citas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario
          </CardTitle>
          <CardDescription>
            Arrastra las citas para reprogramarlas o haz clic para ver detalles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentsCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
