"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Bell,
  Calendar,
  Syringe,
  Info,
  Check,
  Loader2,
  Trash2,
  RefreshCw,
  CheckCircle,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

const NOTIFICATION_ICONS = {
  APPOINTMENT_REMINDER: Calendar,
  VACCINATION_DUE: Syringe,
  GENERAL: Info,
}

const NOTIFICATION_COLORS = {
  APPOINTMENT_REMINDER: "text-blue-500 bg-blue-100",
  VACCINATION_DUE: "text-yellow-600 bg-yellow-100",
  GENERAL: "text-gray-500 bg-gray-100",
}

const NOTIFICATION_LABELS = {
  APPOINTMENT_REMINDER: "Recordatorio de Cita",
  VACCINATION_DUE: "Vacuna Proxima",
  GENERAL: "General",
}

export default function NotificacionesPage() {
  const [activeTab, setActiveTab] = useState("all")

  const { data: notifications, isLoading, refetch } = trpc.notifications.list.useQuery({
    limit: 50,
    unreadOnly: activeTab === "unread",
  })

  const { data: unreadCount = 0 } = trpc.notifications.getUnreadCount.useQuery()

  const { data: upcomingReminders } = trpc.notifications.getUpcomingReminders.useQuery()
  const { data: vaccinationsDue } = trpc.notifications.getVaccinationsDue.useQuery()

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  })

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  })

  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => refetch(),
  })

  const sendAppointmentReminders = trpc.notifications.sendAppointmentReminders.useMutation({
    onSuccess: (data) => {
      refetch()
      alert(`Se enviaron ${data.sent} recordatorios de citas`)
    },
  })

  const sendVaccinationReminders = trpc.notifications.sendVaccinationReminders.useMutation({
    onSuccess: (data) => {
      refetch()
      alert(`Se enviaron ${data.sent} recordatorios de vacunas`)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">
            Gestiona alertas y recordatorios
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Actualizar
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Marcar todo como leido
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Recordatorios de Citas
            </CardTitle>
            <CardDescription>
              {upcomingReminders?.length || 0} cita{(upcomingReminders?.length || 0) !== 1 ? "s" : ""} proxima{(upcomingReminders?.length || 0) !== 1 ? "s" : ""} sin recordatorio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => sendAppointmentReminders.mutate()}
              disabled={sendAppointmentReminders.isPending || (upcomingReminders?.length || 0) === 0}
            >
              {sendAppointmentReminders.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar Recordatorios
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="h-4 w-4 text-yellow-500" />
              Vacunas Proximas
            </CardTitle>
            <CardDescription>
              {vaccinationsDue?.length || 0} vacuna{(vaccinationsDue?.length || 0) !== 1 ? "s" : ""} vence{(vaccinationsDue?.length || 0) !== 1 ? "n" : ""} pronto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => sendVaccinationReminders.mutate()}
              disabled={sendVaccinationReminders.isPending || (vaccinationsDue?.length || 0) === 0}
            >
              {sendVaccinationReminders.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Notificar Vacunas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Historial de Notificaciones
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} sin leer</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">
                Sin leer
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type] || Info
                    const colorClass = NOTIFICATION_COLORS[notification.type] || "text-gray-500 bg-gray-100"
                    const isUnread = !notification.readAt

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex gap-4 rounded-lg border p-4 transition-colors",
                          isUnread && "bg-primary/5 border-primary/20"
                        )}
                      >
                        <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full", colorClass)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={cn("font-medium", isUnread && "font-semibold")}>
                                  {notification.title}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {NOTIFICATION_LABELS[notification.type]}
                                </Badge>
                                {isUnread && (
                                  <Badge variant="default" className="text-xs">
                                    Nueva
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {format(new Date(notification.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {isUnread && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => markAsRead.mutate({ id: notification.id })}
                                  disabled={markAsRead.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteNotification.mutate({ id: notification.id })}
                                disabled={deleteNotification.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No hay notificaciones</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeTab === "unread"
                      ? "No tienes notificaciones sin leer"
                      : "Las notificaciones apareceran aqui"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
