"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc"
import { useState } from "react"
import { toast } from "sonner"

export function ExportMedicalRecordButton({ recordId }: { recordId: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = trpc.pdf.generateMedicalRecord.useMutation({
    onSuccess: ({ pdf, filename }) => {
      // Convertir base64 a blob y descargar
      const blob = base64ToBlob(pdf, "application/pdf")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      setIsGenerating(false)
      toast.success("PDF generado exitosamente")
    },
    onError: (error) => {
      setIsGenerating(false)
      toast.error(error.message || "Error al generar PDF")
    },
  })

  const handleExport = () => {
    setIsGenerating(true)
    generatePDF.mutate({ recordId })
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isGenerating}
      variant="outline"
      size="sm"
    >
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Exportar PDF
    </Button>
  )
}

function base64ToBlob(base64: string, type: string) {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type })
}
