"use client"

import { useState } from "react"
import {
  Globe,
  Copy,
  Check,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PortalAccessCardProps {
  ownerId: string
  ownerName: string
}

export function PortalAccessCard({ ownerId, ownerName }: PortalAccessCardProps) {
  const [copied, setCopied] = useState(false)

  const { data: portalInfo, isLoading, refetch } = trpc.owners.getPortalInfo.useQuery({ id: ownerId })

  const generateToken = trpc.owners.generatePortalToken.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const toggleAccess = trpc.owners.togglePortalAccess.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const portalUrl = portalInfo?.portalToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${portalInfo.portalToken}`
    : null

  const handleCopy = async () => {
    if (portalUrl) {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGenerateToken = () => {
    generateToken.mutate({ id: ownerId })
  }

  const handleToggleAccess = () => {
    if (portalInfo) {
      toggleAccess.mutate({ id: ownerId, enabled: !portalInfo.portalEnabled })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Portal del Cliente
            </CardTitle>
            <CardDescription>
              Acceso al portal web para {ownerName}
            </CardDescription>
          </div>
          <Badge variant={portalInfo?.portalEnabled ? "default" : "secondary"}>
            {portalInfo?.portalEnabled ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portal Status */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            {portalInfo?.portalEnabled ? (
              <ToggleRight className="h-8 w-8 text-green-500" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {portalInfo?.portalEnabled ? "Portal Habilitado" : "Portal Deshabilitado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {portalInfo?.portalEnabled
                  ? "El cliente puede acceder a su informacion"
                  : "El cliente no puede acceder al portal"}
              </p>
            </div>
          </div>
          <Button
            variant={portalInfo?.portalEnabled ? "outline" : "default"}
            onClick={handleToggleAccess}
            disabled={toggleAccess.isPending || !portalInfo?.portalToken}
          >
            {toggleAccess.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : portalInfo?.portalEnabled ? (
              "Desactivar"
            ) : (
              "Activar"
            )}
          </Button>
        </div>

        {/* Generate Token */}
        {!portalInfo?.portalToken ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Globe className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-3 font-medium">Sin acceso al portal</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Genera un enlace de acceso para que el cliente pueda ver su informacion
            </p>
            <Button
              className="mt-4"
              onClick={handleGenerateToken}
              disabled={generateToken.isPending}
            >
              {generateToken.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generar Enlace de Acceso
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Portal URL */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Enlace de Acceso</p>
              <div className="flex gap-2">
                <Input
                  value={portalUrl || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="flex-shrink-0"
                >
                  <a href={portalUrl || "#"} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Comparte este enlace con el cliente para que pueda acceder al portal
              </p>
            </div>

            {/* Last Access */}
            {portalInfo?.lastLoginAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Ultimo acceso: {format(new Date(portalInfo.lastLoginAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </div>
            )}

            {/* Regenerate Token */}
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateToken}
                disabled={generateToken.isPending}
              >
                {generateToken.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerar Enlace
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                Al regenerar, el enlace anterior dejara de funcionar
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
