"use client"

import Link from "next/link"
import { ArrowLeft, Palette, Moon, Sun, Monitor } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function AparienciaPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/configuracion"
          className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-muted-foreground">
            Personaliza la apariencia de la aplicación
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Tema</CardTitle>
          </div>
          <CardDescription>
            Selecciona cómo quieres que se vea Veterinaria Drago
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme} className="grid gap-4">
            {/* Light Theme */}
            <div
              className={`flex items-center space-x-4 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent"
              }`}
              onClick={() => setTheme("light")}
            >
              <RadioGroupItem value="light" id="light" />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                    <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div>
                    <Label htmlFor="light" className="cursor-pointer font-medium">
                      Modo Claro
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tema claro para ambientes iluminados
                    </p>
                  </div>
                </div>
                {theme === "light" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>

            {/* Dark Theme */}
            <div
              className={`flex items-center space-x-4 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent"
              }`}
              onClick={() => setTheme("dark")}
            >
              <RadioGroupItem value="dark" id="dark" />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                    <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <Label htmlFor="dark" className="cursor-pointer font-medium">
                      Modo Oscuro
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tema oscuro para reducir fatiga visual
                    </p>
                  </div>
                </div>
                {theme === "dark" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>

            {/* System Theme */}
            <div
              className={`flex items-center space-x-4 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                theme === "system"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent"
              }`}
              onClick={() => setTheme("system")}
            >
              <RadioGroupItem value="system" id="system" />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Label htmlFor="system" className="cursor-pointer font-medium">
                      Sistema
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Usa la configuración de tu sistema operativo
                    </p>
                  </div>
                </div>
                {theme === "system" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
          <CardDescription>
            Así se ve el tema seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10" />
              <div className="space-y-1">
                <div className="h-4 w-32 rounded bg-foreground/20" />
                <div className="h-3 w-24 rounded bg-foreground/10" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-foreground/10" />
              <div className="h-3 w-4/5 rounded bg-foreground/10" />
              <div className="h-3 w-3/5 rounded bg-foreground/10" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
