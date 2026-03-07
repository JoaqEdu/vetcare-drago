"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"
import { toast } from "sonner"

interface ExportButtonProps {
  data: any[]
  filename: string
  formatData?: (data: any[]) => any[]
  disabled?: boolean
}

export function ExportButton({
  data,
  filename,
  formatData,
  disabled = false
}: ExportButtonProps) {
  const handleExportCSV = () => {
    try {
      const dataToExport = formatData ? formatData(data) : data
      exportToCSV(dataToExport, filename)
      toast.success("Datos exportados a CSV exitosamente")
    } catch (error) {
      toast.error("Error al exportar a CSV")
      console.error(error)
    }
  }

  const handleExportExcel = () => {
    try {
      const dataToExport = formatData ? formatData(data) : data
      exportToExcel(dataToExport, filename)
      toast.success("Datos exportados a Excel exitosamente")
    } catch (error) {
      toast.error("Error al exportar a Excel")
      console.error(error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          Exportar como CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          Exportar como Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
