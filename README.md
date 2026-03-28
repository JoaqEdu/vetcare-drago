# Veterinaria Drago

Sistema de gestión veterinaria profesional desarrollado con Next.js 16, React 19 y TypeScript.

**Estado:** ✅ Listo para producción
**Última actualización:** 22 de marzo de 2026

## Descripción

Veterinaria Drago es un sistema completo para clínicas veterinarias que permite gestionar:

- **Pacientes:** Registro completo de mascotas con historial médico
- **Propietarios:** Gestión de clientes y sus mascotas
- **Citas:** Calendario visual interactivo con drag & drop
- **Expedientes Médicos:** Historial clínico con exportación PDF
- **Vacunación:** Registro y seguimiento de vacunas
- **Desparasitación:** Control de tratamientos antiparasitarios
- **Procedimientos Dentales:** Registro de tratamientos dentales
- **Laboratorio y Rayos X:** Gestión de estudios diagnósticos
- **Portal de Clientes:** Acceso para propietarios con token único
- **Gestión de Usuarios:** Administración de equipo con roles

## Estado del Proyecto

| Módulo | Estado | Completitud |
|--------|--------|-------------|
| Gestión de Pacientes | ✅ Completo | 100% |
| Gestión de Propietarios | ✅ Completo | 100% |
| Sistema de Citas | ✅ Completo | 100% |
| Expedientes Médicos | ✅ Completo | 100% |
| Vacunaciones | ✅ Completo | 100% |
| Desparasitaciones | ✅ Completo | 100% |
| Portal de Clientes | ✅ Completo | 100% |
| Gestión de Usuarios | ✅ Completo | 100% |
| Reportes | ✅ Completo | 100% |
| Dark Mode | ✅ Completo | 100% |

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

### Portal de Clientes
- Acceso mediante token único generado por la clínica
- Vista de mascotas registradas
- Historial de citas
- Próximas vacunas y desparasitaciones
- Interfaz separada del dashboard administrativo

### Gestión de Usuarios y Seguridad
- Roles: Administrador, Veterinario, Recepcionista
- Cambio de contraseña propia (usuarios)
- Reseteo de contraseña por admin
- Activación/desactivación de cuentas
- Activación/desactivación de portales de clientes

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

## Despliegue en Producción

### Opción Recomendada: Vercel + Supabase

**Base de Datos (Supabase):**
```bash
# 1. Crear proyecto en supabase.com
# 2. Obtener connection string de Settings > Database
# 3. Configurar en variables de entorno de Vercel
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Beneficios de Supabase:**
- Backups automáticos diarios
- Panel de administración SQL
- Escalado automático
- SSL incluido

**Frontend (Vercel):**
```bash
# Conectar repositorio a Vercel
# Configurar variables de entorno:
DATABASE_URL="..."
NEXTAUTH_SECRET="..."  # Generar con: openssl rand -base64 32
NEXTAUTH_URL="https://tu-dominio.com"
```

### Después del Deploy

```bash
# Ejecutar seed para crear admin inicial
npx prisma db seed
```

## Mejoras Futuras Recomendadas

### Prioridad Alta
- [ ] **Notificaciones por Email:** Recordatorios de citas y vacunas
- [ ] **Sistema de Respaldos:** Exportación periódica de datos
- [ ] **Auditoría:** Log de acciones críticas (quién hizo qué)

### Prioridad Media
- [ ] **Facturación Básica:** Generación de recibos/facturas
- [ ] **Reportes Avanzados:** Gráficos de tendencias, comparativas
- [ ] **Agenda del Veterinario:** Vista personal de citas del día
- [ ] **Búsqueda Avanzada:** Filtros por fecha, especie, condición

### Prioridad Baja
- [ ] **App Móvil:** PWA o React Native
- [ ] **Integración con Laboratorios:** Importación automática de resultados
- [ ] **Telemedicina:** Videoconsultas integradas
- [ ] **Multi-idioma:** Soporte para inglés

## Documentación Adicional

Para documentación técnica detallada, consultar `CLAUDE.md`.

## Licencia

Proyecto privado - Todos los derechos reservados.
