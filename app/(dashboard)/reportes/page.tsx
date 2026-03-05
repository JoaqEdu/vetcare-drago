"use client"

import { useState } from "react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PawPrint,
  Package,
  Users,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B6B"]

const SPECIES_LABELS: Record<string, string> = {
  DOG: "Perros",
  CAT: "Gatos",
  BIRD: "Aves",
  RABBIT: "Conejos",
  HAMSTER: "Hamsters",
  FISH: "Peces",
  REPTILE: "Reptiles",
  OTHER: "Otros",
}

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  CHECKUP: "Consulta",
  VACCINATION: "Vacunacion",
  SURGERY: "Cirugia",
  EMERGENCY: "Emergencia",
  GROOMING: "Estetica",
  DENTAL: "Dental",
  LABORATORY: "Laboratorio",
  XRAY: "Radiografia",
  FOLLOWUP: "Seguimiento",
  OTHER: "Otro",
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programadas",
  CONFIRMED: "Confirmadas",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completadas",
  CANCELED: "Canceladas",
  NO_SHOW: "No Asistio",
}

export default function ReportesPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year">("month")

  const getDateRange = () => {
    if (dateRange === "month") {
      return {
        startDate: startOfMonth(new Date(selectedYear, selectedMonth - 1)),
        endDate: endOfMonth(new Date(selectedYear, selectedMonth - 1)),
      }
    } else if (dateRange === "quarter") {
      const quarterStart = Math.floor((selectedMonth - 1) / 3) * 3
      return {
        startDate: startOfMonth(new Date(selectedYear, quarterStart)),
        endDate: endOfMonth(new Date(selectedYear, quarterStart + 2)),
      }
    } else {
      return {
        startDate: new Date(selectedYear, 0, 1),
        endDate: new Date(selectedYear, 11, 31, 23, 59, 59),
      }
    }
  }

  const { startDate, endDate } = getDateRange()

  const { data: monthlySummary, isLoading: summaryLoading } = trpc.reports.getMonthlySummary.useQuery({
    year: selectedYear,
    month: selectedMonth,
  })

  const { data: revenueData, isLoading: revenueLoading } = trpc.reports.getRevenueReport.useQuery({
    startDate,
    endDate,
    groupBy: dateRange === "year" ? "month" : "day",
  })

  const { data: appointmentsData, isLoading: appointmentsLoading } = trpc.reports.getAppointmentsReport.useQuery({
    startDate,
    endDate,
  })

  const { data: patientsData, isLoading: patientsLoading } = trpc.reports.getPatientsReport.useQuery({
    startDate,
    endDate,
  })

  const { data: topServices, isLoading: servicesLoading } = trpc.reports.getTopServicesReport.useQuery({
    startDate,
    endDate,
    limit: 5,
  })

  const { data: inventoryData, isLoading: inventoryLoading } = trpc.reports.getInventoryReport.useQuery()

  const { data: vetPerformance, isLoading: vetLoading } = trpc.reports.getVetPerformanceReport.useQuery({
    startDate,
    endDate,
  })

  const isLoading = summaryLoading || revenueLoading || appointmentsLoading || patientsLoading

  const months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ]

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tu clinica
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      {monthlySummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlySummary.revenue.current.toFixed(2)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {monthlySummary.revenue.change >= 0 ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={monthlySummary.revenue.change >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(monthlySummary.revenue.change).toFixed(1)}%
                </span>
                <span className="ml-1">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Citas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlySummary.appointments.current}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {monthlySummary.appointments.change >= 0 ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={monthlySummary.appointments.change >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(monthlySummary.appointments.change).toFixed(1)}%
                </span>
                <span className="ml-1">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Pacientes</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlySummary.newPatients.current}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {monthlySummary.newPatients.change >= 0 ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={monthlySummary.newPatients.change >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(monthlySummary.newPatients.change).toFixed(1)}%
                </span>
                <span className="ml-1">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlySummary.newOwners}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Ingresos por Periodo</CardTitle>
                <CardDescription>
                  Total: ${revenueData?.summary.totalRevenue.toFixed(2) || "0.00"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : revenueData?.data && revenueData.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => {
                          const date = new Date(v)
                          return dateRange === "year"
                            ? format(date, "MMM", { locale: es })
                            : format(date, "d", { locale: es })
                        }}
                      />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, "Ingresos"]}
                        labelFormatter={(label) => format(new Date(label), "d MMM yyyy", { locale: es })}
                      />
                      <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No hay datos para mostrar
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Servicios</CardTitle>
                <CardDescription>Servicios mas vendidos</CardDescription>
              </CardHeader>
              <CardContent>
                {servicesLoading ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : topServices && topServices.length > 0 ? (
                  <div className="space-y-4">
                    {topServices.map((service, i) => (
                      <div key={service.description} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{service.description}</span>
                          <span className="font-medium">${service.revenue.toFixed(2)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${(service.revenue / topServices[0].revenue) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                    No hay datos
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentsData?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tasa de Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {appointmentsData?.completionRate.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tasa de Cancelacion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {appointmentsData?.cancellationRate.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Citas por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : appointmentsData?.byType && appointmentsData.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={appointmentsData.byType.map((d) => ({
                          ...d,
                          name: APPOINTMENT_TYPE_LABELS[d.type] || d.type,
                        }))}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {appointmentsData.byType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No hay datos
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Citas por Dia de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : appointmentsData?.byDayOfWeek && appointmentsData.byDayOfWeek.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={appointmentsData.byDayOfWeek}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No hay datos
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Vet Performance */}
          {vetPerformance && vetPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Veterinario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vetPerformance.map((vet) => (
                    <div key={vet.vetId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vet.vetName}</p>
                        <p className="text-sm text-muted-foreground">
                          {vet.total} citas | {vet.completed} completadas | {vet.canceled} canceladas
                        </p>
                      </div>
                      <Badge variant={vet.completionRate >= 80 ? "default" : "secondary"}>
                        {vet.completionRate.toFixed(0)}% completadas
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pacientes Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientsData?.totalActive || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Nuevos en Periodo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{patientsData?.newPatients || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Atendidos en Periodo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{patientsData?.attendedInPeriod || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pacientes por Especie</CardTitle>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : patientsData?.bySpecies && patientsData.bySpecies.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={patientsData.bySpecies.map((d) => ({
                        ...d,
                        name: SPECIES_LABELS[d.species] || d.species,
                      }))}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {patientsData.bySpecies.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No hay datos
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryData?.totalProducts || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Valor Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${inventoryData?.totalValue.toFixed(2) || "0.00"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Stock Bajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{inventoryData?.lowStockCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sin Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{inventoryData?.outOfStockCount || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Valor por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : inventoryData?.byCategory && inventoryData.byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inventoryData.byCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                      <YAxis type="category" dataKey="category" width={100} />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Valor"]} />
                      <Bar dataKey="value" fill="#8884D8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No hay datos
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Costo Total</span>
                    <span className="font-medium">${inventoryData?.totalValue.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Valor de Venta Potencial</span>
                    <span className="font-medium">${inventoryData?.potentialRevenue.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Ganancia Potencial</span>
                    <span className="font-bold text-green-600">
                      ${inventoryData?.potentialProfit.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
