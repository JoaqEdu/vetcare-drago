"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Stethoscope,
  LayoutDashboard,
  PawPrint,
  Users,
  Calendar,
  FileText,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { NotificationBell } from "@/components/notifications/notification-bell"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pacientes",
    href: "/pacientes",
    icon: PawPrint,
  },
  {
    title: "Propietarios",
    href: "/propietarios",
    icon: Users,
  },
  {
    title: "Citas",
    href: "/citas",
    icon: Calendar,
  },
  {
    title: "Facturacion",
    href: "/facturacion",
    icon: FileText,
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Package,
  },
  {
    title: "Notificaciones",
    href: "/notificaciones",
    icon: Bell,
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: BarChart3,
  },
]

const bottomNavItems = [
  {
    title: "Configuracion",
    href: "/configuracion",
    icon: Settings,
  },
]

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    organizationName?: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const NavLink = ({
    item,
  }: {
    item: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }
  }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
    const Icon = item.icon

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      )
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-background/95 backdrop-blur px-4 py-3 border-b md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <span className="font-bold">VetCare</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 md:relative",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold">VetCare</span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            {!isCollapsed && <NotificationBell />}
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>
        </div>

        {/* Organization name */}
        {!isCollapsed && user.organizationName && (
          <div className="border-b border-sidebar-border px-4 py-3">
            <p className="text-xs text-sidebar-foreground/50">Organizacion</p>
            <p className="truncate text-sm font-medium">
              {user.organizationName}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Bottom navigation */}
        <nav className="space-y-1 p-3">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar sesion</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesion</span>
            </button>
          )}
        </nav>

        {/* User info */}
        {!isCollapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
                <span className="text-sm font-medium text-sidebar-accent-foreground">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/50">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
