# VetCare Drago

Sistema de gestión veterinaria profesional desarrollado con Next.js 16, React 19 y TypeScript.

## Descripcion

VetCare Drago es un sistema completo para clínicas veterinarias que permite gestionar:

- **Pacientes:** Registro completo de mascotas con historial médico
- **Propietarios:** Gestión de clientes y sus mascotas
- **Citas:** Calendario visual interactivo con drag & drop
- **Expedientes Médicos:** Historial clínico con exportación PDF
- **Vacunación:** Registro y seguimiento de vacunas
- **Desparasitación:** Control de tratamientos antiparasitarios
- **Procedimientos Dentales:** Registro de tratamientos dentales
- **Laboratorio y Rayos X:** Gestión de estudios diagnósticos

## Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS v4
- **Backend:** tRPC (Type-safe API)
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Autenticación:** NextAuth.js
- **UI:** Shadcn/ui, Framer Motion
- **Calendario:** FullCalendar
- **PDFs:** @react-pdf/renderer
- **Formularios:** React Hook Form + Zod

## Características Principales

### Gestión de Citas
- Calendario visual con vistas día/semana/mes
- Drag & drop para reprogramar citas
- Filtro de citas activas/completadas
- Vinculación directa cita-registro médico (1:1)
- Creación automática de citas de seguimiento

### Expedientes Médicos
- Timeline unificado del historial del paciente
- Exportación a PDF profesional
- Registros de vacunas, desparasitaciones, dental, laboratorio y rayos X
- Cada cita genera máximo un registro médico

### Interfaz de Usuario
- Dark mode completo
- Dashboard personalizable con widgets drag & drop
- Command Palette (Cmd+K) para búsqueda global
- Breadcrumbs automáticos
- Toast notifications
- Skeleton loaders
- Diseño responsive

### Accesibilidad
- Skip navigation
- Focus indicators
- ARIA labels
- Navegación por teclado

## Inicio Rápido

### Requisitos
- Node.js 18+
- PostgreSQL
- pnpm (recomendado)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/vetcare-drago.git
cd vetcare-drago

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Configurar base de datos
npx prisma db push
npx prisma generate

# Ejecutar seed (opcional)
npx prisma db seed

# Iniciar servidor de desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts Disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm start        # Iniciar producción
pnpm lint         # Verificar linting
```

## Comandos de Base de Datos

```bash
npx prisma studio          # Abrir Prisma Studio
npx prisma db push         # Sincronizar schema
npx prisma migrate dev     # Crear migración
npx prisma generate        # Generar cliente
```

## Estructura del Proyecto

```
vetcare-drago/
├── app/                    # Páginas Next.js (App Router)
│   ├── (dashboard)/       # Rutas del dashboard
│   │   ├── calendario/    # Calendario de citas
│   │   ├── citas/         # Gestión de citas
│   │   ├── pacientes/     # Gestión de pacientes
│   │   ├── propietarios/  # Gestión de propietarios
│   │   └── reportes/      # Reportes y analytics
│   └── api/               # API routes
├── components/            # Componentes React
│   ├── calendar/          # Calendario visual
│   ├── dashboard/         # Widgets del dashboard
│   ├── forms/             # Formularios
│   ├── tables/            # Tablas de datos
│   ├── timeline/          # Timeline médico
│   └── ui/                # Componentes base (shadcn/ui)
├── lib/                   # Utilidades y configuración
│   ├── pdf/               # Generación de PDFs
│   └── validations/       # Schemas Zod
├── prisma/                # Schema y migraciones
└── server/                # Backend tRPC
    └── routers/           # Routers de API
```

## Variables de Entorno

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## Documentación Adicional

Para documentación técnica detallada, consultar `CLAUDE.md`.

## Licencia

Proyecto privado - Todos los derechos reservados.
