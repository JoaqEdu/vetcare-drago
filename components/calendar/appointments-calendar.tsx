"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import { trpc } from "@/lib/trpc"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const STATUS_COLORS = {
  SCHEDULED: "#3b82f6", // blue
  CONFIRMED: "#10b981", // green
  IN_PROGRESS: "#f59e0b", // amber
  COMPLETED: "#6366f1", // indigo
  CANCELED: "#ef4444", // red
  NO_SHOW: "#6b7280", // gray
}

export function AppointmentsCalendar() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
  })

  const { data: appointments, refetch } =
    trpc.appointments.getByDateRange.useQuery({
      startDate: dateRange.start,
      endDate: dateRange.end,
    })

  const updateAppointment = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast.success("Cita actualizada")
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar cita")
    },
  })

  const events =
    appointments?.map((apt) => ({
      id: apt.id,
      title: `${apt.patient.name} - ${apt.type}`,
      start: apt.scheduledAt,
      end: new Date(apt.scheduledAt.getTime() + apt.duration * 60000),
      backgroundColor: STATUS_COLORS[apt.status],
      borderColor: STATUS_COLORS[apt.status],
      extendedProps: {
        patientId: apt.patient.id,
        ownerName: `${apt.patient.owner.firstName} ${apt.patient.owner.lastName}`,
        vetName: apt.vet.name,
        status: apt.status,
        type: apt.type,
        reason: apt.reason,
      },
    })) || []

  const handleEventDrop = (info: any) => {
    const newDate = info.event.start

    if (!newDate) {
      info.revert()
      return
    }

    if (
      confirm(
        `¿Reprogramar cita a ${newDate.toLocaleString("es-ES", {
          dateStyle: "full",
          timeStyle: "short",
        })}?`
      )
    ) {
      updateAppointment.mutate({
        id: info.event.id,
        scheduledAt: newDate,
      })
    } else {
      info.revert()
    }
  }

  const handleEventResize = (info: any) => {
    const newStart = info.event.start
    const newEnd = info.event.end

    if (!newStart || !newEnd) {
      info.revert()
      return
    }

    const newDuration = Math.round((newEnd.getTime() - newStart.getTime()) / 60000)

    if (newDuration < 15 || newDuration > 480) {
      toast.error("La duración debe estar entre 15 minutos y 8 horas")
      info.revert()
      return
    }

    if (confirm(`¿Cambiar la duración a ${newDuration} minutos?`)) {
      updateAppointment.mutate({
        id: info.event.id,
        scheduledAt: newStart,
        duration: newDuration,
      })
    } else {
      info.revert()
    }
  }

  const handleDateClick = (info: any) => {
    // Navegar a crear cita con fecha pre-poblada
    const dateStr = info.dateStr
    router.push(`/citas/nueva?date=${dateStr}`)
  }

  const handleEventClick = (info: any) => {
    // Navegar a detalles de cita
    router.push(`/citas/${info.event.id}`)
  }

  return (
    <div className="h-[800px] bg-background p-4 rounded-lg border">
      <style jsx global>{`
        .fc {
          --fc-border-color: hsl(var(--border));
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-active-border-color: hsl(var(--primary) / 0.8);
          --fc-today-bg-color: hsl(var(--accent));
        }

        .fc .fc-button {
          text-transform: capitalize;
        }

        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: hsl(var(--border));
        }

        .fc-theme-standard .fc-scrollgrid {
          border-color: hsl(var(--border));
        }

        .fc .fc-daygrid-day-number,
        .fc .fc-col-header-cell-cushion {
          color: hsl(var(--foreground));
        }

        .fc .fc-timegrid-slot-label {
          color: hsl(var(--muted-foreground));
        }

        .fc-event {
          cursor: pointer;
          border-radius: 4px;
        }

        .fc-event:hover {
          opacity: 0.9;
        }

        .fc .fc-daygrid-day.fc-day-today {
          background-color: hsl(var(--accent));
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale={esLocale}
        events={events}
        editable={true}
        droppable={false}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        datesSet={(dateInfo) => {
          setDateRange({
            start: dateInfo.start,
            end: dateInfo.end,
          })
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          startTime: "09:00",
          endTime: "19:00",
        }}
        height="100%"
        nowIndicator={true}
        eventContent={(arg) => (
          <div className="p-1 text-xs">
            <div className="font-semibold truncate">{arg.event.title}</div>
            <div className="opacity-90 truncate">
              {arg.event.extendedProps.vetName}
            </div>
            {arg.event.extendedProps.reason && (
              <div className="opacity-75 text-[10px] truncate">
                {arg.event.extendedProps.reason}
              </div>
            )}
          </div>
        )}
        allDaySlot={false}
        weekends={true}
        firstDay={1} // Lunes
      />
    </div>
  )
}
