"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Fragment } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  pacientes: "Pacientes",
  propietarios: "Propietarios",
  citas: "Citas",
  calendario: "Calendario",
  notificaciones: "Notificaciones",
  reportes: "Reportes",
  configuracion: "Configuración",
  nuevo: "Nuevo",
  nueva: "Nueva",
  editar: "Editar",
  expediente: "Expediente",
  vacunas: "Vacunas",
  equipo: "Equipo",
  notificaciones: "Notificaciones",
  seguridad: "Seguridad",
  apariencia: "Apariencia",
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  // Don't show breadcrumbs on home/login pages
  if (pathname === "/" || pathname === "/login" || pathname === "/dashboard") {
    return null
  }

  const paths = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              Inicio
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {paths.map((path, index) => {
          // Skip dashboard as we already show it as "Inicio"
          if (path === "dashboard") return null

          const href = "/" + paths.slice(0, index + 1).join("/")
          const label = routeLabels[path] || path
          const isLast = index === paths.length - 1

          // Skip UUID-like segments (patient IDs, owner IDs, etc.)
          const isUUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(path)
          if (isUUID && !isLast) {
            return null
          }

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{isUUID ? "Detalles" : label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
