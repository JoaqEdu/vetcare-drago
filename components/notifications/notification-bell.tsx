"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Bell,
  Calendar,
  Syringe,
  Package,
  FileText,
  Info,
  Check,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

const NOTIFICATION_ICONS = {
  APPOINTMENT_REMINDER: Calendar,
  VACCINATION_DUE: Syringe,
  LOW_STOCK: Package,
  INVOICE_OVERDUE: FileText,
  GENERAL: Info,
}

const NOTIFICATION_COLORS = {
  APPOINTMENT_REMINDER: "text-blue-500",
  VACCINATION_DUE: "text-yellow-500",
  LOW_STOCK: "text-red-500",
  INVOICE_OVERDUE: "text-orange-500",
  GENERAL: "text-gray-500",
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)

  const { data: unreadCount = 0 } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: notifications, isLoading, refetch } = trpc.notifications.list.useQuery(
    { limit: 10, unreadOnly: false },
    { enabled: open }
  )

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  })

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  })

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate({ id })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Marcar todo como leido
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type] || Info
                const colorClass = NOTIFICATION_COLORS[notification.type] || "text-gray-500"
                const isUnread = !notification.readAt

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-3 cursor-pointer transition-colors hover:bg-muted",
                      isUnread && "bg-primary/5"
                    )}
                    onClick={() => !notification.readAt && handleMarkAsRead(notification.id)}
                  >
                    <div className={cn("flex-shrink-0 mt-0.5", colorClass)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium", isUnread && "font-semibold")}>
                          {notification.title}
                        </p>
                        {isUnread && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.createdAt), "d MMM, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No hay notificaciones
              </p>
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center">
          <Link href="/notificaciones" className="w-full text-center text-sm">
            Ver todas las notificaciones
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
