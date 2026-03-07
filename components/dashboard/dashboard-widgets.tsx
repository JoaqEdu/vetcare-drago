"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableWidget } from "./sortable-widget"
import { StatsWidget } from "./widgets/stats-widget"
import { AppointmentsWidget } from "./widgets/appointments-widget"
import { VaccinationsWidget } from "./widgets/vaccinations-widget"

const WIDGET_COMPONENTS = {
  stats: { component: StatsWidget, title: "Estadísticas" },
  appointments: { component: AppointmentsWidget, title: "Próximas Citas" },
  vaccinations: { component: VaccinationsWidget, title: "Vacunas Pendientes" },
}

const DEFAULT_WIDGET_ORDER = ["stats", "appointments", "vaccinations"]
const STORAGE_KEY = "vetcare-widget-order"

export function DashboardWidgets() {
  const [widgets, setWidgets] = useState<string[]>(DEFAULT_WIDGET_ORDER)
  const [mounted, setMounted] = useState(false)

  // Load widget order from localStorage only on client
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setWidgets(parsed)
        }
      } catch (error) {
        console.error("Failed to parse widget order:", error)
      }
    }
  }, [])

  // Save widget order to localStorage
  const saveWidgetOrder = (newOrder: string[]) => {
    setWidgets(newOrder)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder))
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = widgets.indexOf(active.id as string)
      const newIndex = widgets.indexOf(over.id as string)
      const newOrder = arrayMove(widgets, oldIndex, newIndex)
      saveWidgetOrder(newOrder)
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="space-y-6">
        {DEFAULT_WIDGET_ORDER.map((widgetId) => {
          const config = WIDGET_COMPONENTS[widgetId as keyof typeof WIDGET_COMPONENTS]
          if (!config) return null

          return (
            <div key={widgetId} className="rounded-lg border bg-card">
              <div className="p-4">
                <h3 className="text-base font-medium mb-4">{config.title}</h3>
                <div className="space-y-3">
                  <div className="h-20 rounded-md bg-muted animate-pulse" />
                  <div className="h-20 rounded-md bg-muted animate-pulse" />
                  <div className="h-20 rounded-md bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {widgets.map((widgetId) => {
            const config = WIDGET_COMPONENTS[widgetId as keyof typeof WIDGET_COMPONENTS]
            if (!config) return null

            const WidgetComponent = config.component

            return (
              <SortableWidget key={widgetId} id={widgetId} title={config.title}>
                <WidgetComponent />
              </SortableWidget>
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
